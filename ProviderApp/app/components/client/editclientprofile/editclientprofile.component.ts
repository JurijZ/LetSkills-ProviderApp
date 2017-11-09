import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';


@Component({
    selector: 'editclientprofile',
    templateUrl: './editclientprofile.component.html',
    styleUrls: ['./editclientprofile.component.css']
})

export class EditClientProfileComponent {
    
    public url: string;
    public url3: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages
    
    // API returns a single object
    clientProfile: ClientProfile; 

    // Form related variables
    rForm: FormGroup;
    post: any;                     // A property for our submitted form
    //newjob: NewJob = {};
    updatedClientProfile: UpdatedClientProfile = {};

    //titleAlert: string = 'This field is required';
    nameAlert: string = 'You must specify a Title thats between 5 and 50 characters'

    // File upload variables
    public url2: string;
    private isUploadBtn: boolean = true;
    uploading: boolean = true;
    imageCountValidation: boolean = true;
    myFile: File; /* property of File type */
    selectedImage;

    // Validator patterns
    pureEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    regexValidators = {
        phone: '[\+][0-9() ]{7,}$',
        email: this.pureEmail,
    };

    constructor(private fb: FormBuilder,
                authService: AuthService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private http: Http) {
        
 
        this.url = apiUrl + 'getclientprofile';         // GET selected job details
        this.url2 = apiUrl                              // For the File Upload URL
        this.url3 = apiUrl + 'editclientprofile';       // POST edited job details
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'
        

        // Setup fields in the FormBuilder
        this.rForm = fb.group({
            'name': [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'surname': [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'contactEmail': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(50), Validators.pattern(this.regexValidators.email)])],
            'contactTelephone1': [null, Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            'contactTelephone2': [null, Validators.compose([Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            
            'validate': ''
        });

        
        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.clientProfile = result.json() as ClientProfile;

                // Populate form with received data
                this.rForm.patchValue({
                    name: this.clientProfile.name,
                    surname: this.clientProfile.surname,
                    contactEmail: this.clientProfile.contactEmail,
                    contactTelephone1: this.clientProfile.contactTelephone1,
                    contactTelephone2: this.clientProfile.contactTelephone2,
                    city: this.clientProfile.city,
                    postCode: this.clientProfile.postCode,

                    profileImage: this.clientProfile.profileImageUrl
                });

                },
                (err) => {
                    if (err === 'Unauthorized') {
                        console.log('Unauthorized, Redirecting....');
                        // Redirect to unauthorized route (it's defined in the app.module.shared.ts)
                        this.router.navigate(['/unauthorized']);
                    }
                }
            );
    }


    // POST the form to WEBAPI
    editClientProfile(formdata) {
        console.log("Name from the form: " + formdata.name);

        // Prepare the JSON body message
        this.updatedClientProfile.name = formdata.name;
        this.updatedClientProfile.surname = formdata.surname;
        this.updatedClientProfile.contactEmail = formdata.contactEmail;
        this.updatedClientProfile.contactTelephone1 = formdata.contactTelephone1;
        this.updatedClientProfile.contactTelephone2 = formdata.contactTelephone2;
        this.updatedClientProfile.profileImageUrl = this.clientProfile.profileImageUrl;
        
        let body = JSON.stringify(this.updatedClientProfile);
        console.log(body);

        // PUT (deliver updated values to the server)
        return this.ob = this.auth.put(this.url3, body) //JSON.stringify({ Name: name })
            .subscribe(
                result => {
                    console.log(result);
                    this.status = 1;    // Shows Success message
                },
                err => {
                    console.log('ERROR:');
                    console.log(err);
                    this.status = 0;    // Shows Failure message
                }
            );
    }

    // Zoom into modal window selected image
    setSelectedImage(image) {
        this.selectedImage = image;
    }

    // Delete an image
    removeProfileImage() {
        this.clientProfile.profileImageUrl = null;
        console.log("Deleting an image: " + this.clientProfile.profileImageUrl);
    }

    // Upload images to Backend  
    fileChange(event) {
        //debugger; //To pause program execution at this point

        let fileList: FileList = event.target.files;

        // Cehck if the number of selected images is less then 4
        if (fileList.length == 1 ) {

            //let file: File = fileList[0];
            this.imageCountValidation = true;
            let formData: FormData = new FormData();

            for (let file of Array.from(fileList)) {
                console.log("Added Filename: " + file.name);
                formData.append('Files', file, file.name);
            }

            let headers = new Headers()
            //headers.append('Content-Type', 'json');  
            //headers.append('Accept', 'application/json');  
            let options = new RequestOptions({ headers: headers });
            let fileUploadUrl = this.url2 + "UploadProfileImage";

            // Shows uploading images
            this.uploading = false;

            console.log(fileUploadUrl);

            this.http.post(fileUploadUrl, formData, options)
                .map(res => res.json())
                .catch(error => Observable.throw(error))
                .subscribe(
                    data => {
                        console.log('success');
                        console.log(data);

                        // Delay is added because it takes time to load images to S3
                        // and imediate call to the URL will return 403 error (althought technically image is not yet there)
                        // and as a result an empty thumbnail will be shown to the user

                        //setTimeout(() => { this.jobDetails.images = data.images; this.uploading = true; }, 3000);
                        setTimeout(() => {
                            this.clientProfile.profileImageUrl = data.image;
                            this.uploading = true;
                            console.log("Uploaded Image: " + this.clientProfile.profileImageUrl);
                        }, 3000);
                        
                    },
                    error => {
                        console.log(error)
                    }
                )
        }
        else {
            this.imageCountValidation = false; // Enables Alert message
        }
    }
}


interface ClientProfile {
    id?: number,
    name?: string,
    surname?: string,
    username?: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    lastLoginTime?: Date,

    contactEmail?: string,
    contactTelephone1?: string,
    contactTelephone2?: string,
    profileImageUrl?: string,

    country?: string,
    city?: string,
    adressLine1?: string,
    adressLine2?: string,
    postCode?: string
};

interface UpdatedClientProfile {
    //id: number,
    name?: string,
    surname?: string,
    //username: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    //lastLoginTime: Date,

    contactEmail?: string,
    contactTelephone1?: string,
    contactTelephone2?: string,
    profileImageUrl?: string,

    //country: string,
    //city: string,
    //adressLine1: string,
    //adressLine2: string,
    //postCode: string
};
