// main.go

package main

import (
    "os"
    "io"
    "fmt"
    "github.com/kataras/iris"
    "path/filepath"
    "github.com/daddye/vips"
    "github.com/satori/go.uuid"
    "gopkg.in/h2non/filetype.v1"
     "github.com/jinzhu/gorm"
     _ "github.com/jinzhu/gorm/dialects/postgres"
    "io/ioutil"
    "strings"
)

const uploadsDir = "./uploads/"

type File struct {
	name string
	oldname string
	extension string
	path string
	documentType string
	buffer []byte
	channel chan bool
}


type AttachmentsNew struct {
 	gorm.Model
	Id int `gorm:"AUTO_INCREMENT"`
	OwnerId int
	Hashkey string 
	Time int
	FileInfo string
	Filepath string
	Doctype string
}





var Database *gorm.DB;


func main() {

	databaseInit();

	defer Database.Close()

    app := iris.New()

    // Render the actual form
    // GET: http://localhost:8080
   
    // Upload the file to the server
    // POST: http://localhost:8080/upload
    // 
    
    app.Use(func(ctx iris.Context) {
        ctx.Application().Logger().Infof("Begin request for path: %s", ctx.Path())
        ctx.Next()
    })

    app.Post("/uploadFile/{token}", iris.LimitRequestBodySize(10<<20), func(ctx iris.Context) {
        // Get the file from the dropzone request
        token := ctx.Params().Get("token");
        fmt.Println(token);
        file, info, err := ctx.FormFile("file")
        if err != nil {
            ctx.StatusCode(iris.StatusInternalServerError)
            ctx.Application().Logger().Warnf("Error while uploading: %v", err.Error())
            return
        }

        defer file.Close()
        fname := info.Filename

        // Create a file with the same name
        // assuming that you have a folder named 'uploads'
        newFileNameUUID, _ := uuid.NewV4();

        newFileName := newFileNameUUID.String();

        extension := filepath.Ext(fname);
        fmt.Println(extension);
        out, err := os.OpenFile(uploadsDir+newFileName+extension,
            os.O_WRONLY|os.O_CREATE, 0666)

        if err != nil {
            ctx.StatusCode(iris.StatusInternalServerError)
            ctx.Application().Logger().Warnf("Error while preparing the new file: %v", err.Error())
            return
        }
        defer out.Close()

        io.Copy(out, file);


        fileObject := File{newFileName+extension, fname, extension, uploadsDir+newFileName+extension, "", []byte{0}, make(chan bool)};

        

        go proccessFile(&fileObject);

        <-fileObject.channel;
        fmt.Println("end");
        close(fileObject.channel);

        attachmentId := fileObject.addAsAttachment(1);

        ctx.JSON(iris.Map{
            "is_error": "0",
            "code": "0",
            "message":attachmentId,
        })

    })

    

    // Start the server at http://localhost:8080
    app.Run(iris.Addr(":3000"))
}

func proccessFile(file *File){
buffer, _ := ioutil.ReadFile(file.path);
file.buffer = buffer;


if filetype.IsImage(buffer) {
	file._proccessPhoto();
} else {
	file._proccessDocument();
}


}

func (file *File) addAsAttachment(ownerId int) uint{

	attachment := &AttachmentsNew{Id:0, OwnerId: ownerId, Hashkey: "test", Time:1, FileInfo:file.oldname, Filepath:file.path, Doctype:file.documentType};

	row := new(AttachmentsNew);

	d := Database.Create(attachment).Scan(&row);
	check(d.Error);

	return row.ID;
}


func (file *File) _proccessDocument(){
fmt.Println("Duck");
file.documentType = "document";

file.channel <- true;

}

func (file *File) _proccessPhoto(){

	defaultOptions := vips.Options{
	Crop:         false,
	Extend:       vips.EXTEND_WHITE,
	Interpolator: vips.BILINEAR,
	Gravity:      vips.CENTRE,
	Quality:      75,
};
	
	mediumSizeOptions := defaultOptions;
	mediumSizeOptions.Width = 500;
	mediumSizeOptions.Height = 500;

	smallSizeOptions := defaultOptions;
	smallSizeOptions.Width = 86;
	smallSizeOptions.Height = 86;

	file.documentType = "image";

	imagesChannel := make(chan bool);

	


	go _processEachPhoto(file, defaultOptions, "compress", imagesChannel);
	go _processEachPhoto(file, mediumSizeOptions, "compress_medium", imagesChannel);
	go _processEachPhoto(file, smallSizeOptions, "compress_little", imagesChannel);

	for i := 0; i < 3; i++ {
		<-imagesChannel;
	}

		close(imagesChannel);

		file.channel <- true;

		



	
}


func _processEachPhoto(file *File, options vips.Options, suffix string, channel chan bool){
	f, _ := os.Open(file.path);
	inBuf, _ := ioutil.ReadAll(f)
	buf, err := vips.Resize(inBuf, options)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return;
	}
	
	fileNameWithoutExtension := strings.Replace(file.name, file.extension, "", -1);

	ioutil.WriteFile(uploadsDir + fileNameWithoutExtension+"_"+suffix+file.extension, buf, 0644);

	channel <- true;
}

func databaseInit(){
	db, err := gorm.Open("postgres", "host=127.0.0.1 port=5432 sslmode=disable user=postgres dbname=DuckMess password=");

	check(err);

	db.AutoMigrate(&AttachmentsNew{});

	Database = db;
	
}


func check(err error){
	if(err != nil){
		panic(err);
	}
}