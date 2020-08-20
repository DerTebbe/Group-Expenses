import {Injectable} from '@angular/core';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {AngularFireStorage} from '@angular/fire/storage';
import {ImagePicker, OutputType} from '@ionic-native/image-picker/ngx';
import {User} from '../models/UserModel';
import {UserServiceService} from './user-service.service';
import {Group} from '../models/GroupModel';
import {GroupService} from './group.service';
import {Invoice} from '../models/InvoiceModel';
import {InvoiceService} from './invoice.service';


@Injectable()
export class ImagesService {
    image;

    /**
     * @description Constructor for image.service
     * @param storage
     * @param camera
     * @param imagePicker
     * @param userService
     * @param groupService
     * @param invoiceService
     * Injects all required services and modules
     */
    constructor(public storage: AngularFireStorage,
                private camera: Camera,
                private imagePicker: ImagePicker,
                private userService: UserServiceService,
                private groupService: GroupService,
                private invoiceService: InvoiceService) {
    }


    /**
     * @description Method to choose an image from the gallery with the image-picker plugin
     * @param fileName will be combined with the uploading users UID to create a unique filename
     * @param userID the users UID
     * @param folder defines the folder in which the image will be stored on firebase-storage
     * @param type variable to define whether the image is a profile-pic or receipt etc. and how to handle it after upload
     * @param user used for further handling after uploading the image, can be null or contain an object
     * @param group used for further handling after uploading the image, can be null or contain an object
     * @param invoice used for further handling after uploading the image, can be null or contain an object
     *
     * Defines the upload parameters like image quality and size
     * Retrieves the image from the image picker and calls the method createUploadTask to handle the upload
     */
    getImages(fileName: string, userID: string, folder: string, type: string, user: User, group: Group, invoice: Invoice) {
        const options = {
            maximumImagesCount: 1,
            width: 500,
            height: 500,
            quality: 75,
            outputType: OutputType.DATA_URL
        };

        this.imagePicker.getPictures(options)
            .then((results) => {
                // this.image = 'data:image/jpeg;base64,' + results[0];
                this.createUploadTask(results[0], folder, fileName, userID, type, user, group, invoice);
            }, (error) => {
                console.log('ERROR -> ' + JSON.stringify(error));
            });
    }

    /**
     * @description Method calls the camera plugin to take a picture
     * @return a base64 string of the taken picture
     */
    async captureImage() {
        const options: CameraOptions = {
            quality: 75,
            allowEdit: true,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: true,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: this.camera.PictureSourceType.CAMERA
        };

        return await this.camera.getPicture(options);
    }

    /**
     * @description Method to handle the upload of an image to the firebase-storage
     * @param file contains the base64 string of the image
     * @param folder defines the folder in which the file will be stored on firebase-storage
     * @param fileName will be combined with the users UID to create a unique filename
     * @param userID contains the users UID or the group-id or the invoice-id, depending on the use case, to keep the filename unique
     * @param type defines how the retrieved download link of the newly uploaded image will be handled after the upload
     * @param user used for further handling after uploading the image, can be null or contain an object
     * @param group used for further handling after uploading the image, can be null or contain an object
     * @param invoice used for further handling after uploading the image, can be null or contain an object
     *
     * After uploading an image to firebase-storage a download URL will be retrieved. Depending on the type parameter this URL will be handled
     * differently.
     * CASE profile: The user object will be updated and stored in cloud-firestore and the locally stored user object will be updated
     * CASE receipt: The Invoice object will be updated and stored in cloud-firestore
     * CASE group: The group object will be updated and stored in cloud-firestore
     */
    createUploadTask(file: string, folder: string, fileName: string, userID: string, type: string, user?: User, group?: Group, invoice?: Invoice) {

        const filePath = folder + '/' + fileName + '_' + userID + `_${new Date().getTime()}.jpg`;

        this.image = 'data:image/jpg;base64,' + file;
        // this.task =
        this.storage.ref(filePath).putString(this.image, 'data_url').then(
            resolve => {
                this.storage.storage.ref().child(filePath).getDownloadURL()
                    .then(
                        res => {
                            console.log(res);
                            if (type === 'profile') {
                                user.picture = res.toString();
                                this.userService.update(user);
                                this.userService.updateProfile(user);
                            } else if (type === 'receipt') {
                                invoice.bildLink = res.toString();
                                this.invoiceService.update(group.id, invoice);
                                /* HIER KÖNNT IHR EUREN KRAM FÜR RECHNUNGEN REINSCHREIBEN. Als Ordner solltet ihr dann beispielsweise 'Receipts' angeben.
                                Beispiel für den Aufruf aus einer anderen component:
                                this.imageService.uploadTakenPicture('receiptPhoto', firebase.auth().currentUser.uid,
                                    'Receipts', 'receipt');
                                    Dabei sind die ersten zwei Parameter für einen Unique Dateiname, der dritte ist der Ordnername, und der letzte
                                    gibt an, dass es sich um eine Rechnung handelt, sodass in diesen Zweig der If Verzweigung gesprungen wird. Optional
                                    kann noch ein User mitgegeben werden, falls er benötigt wird. Ihr könntet auch im ersten Parameter beispielsweise den Gruppennamen
                                    übergeben.
                                 */
                            } else if (type === 'group') {
                                group.bildLink = res.toString();
                                this.groupService.update(group, false);
                            }
                        },
                        err => {
                            console.log(err);
                        });
            }
        );


    }


    /**
     * @description Method to capture an image and create an upload task
     * @param fileName
     * @param fileName will be combined with the uploading users UID to create a unique filename
     * @param userID the users UID
     * @param folder defines the folder in which the image will be stored on firebase-storage
     * @param type variable to define whether the image is a profile-pic or receipt etc. and how to handle it after upload
     * @param user used for further handling after uploading the image, can be null or contain an object
     * @param group used for further handling after uploading the image, can be null or contain an object
     * @param invoice used for further handling after uploading the image, can be null or contain an object
     */
    async uploadTakenPicture(fileName: string, userID: string, folder: string, type: string, user: User, group: Group, invoice: Invoice) {
        const base64 = await this.captureImage();
        return this.createUploadTask(base64, folder, fileName, userID, type, user, group, invoice);
    }


}
