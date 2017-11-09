import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';
import { ProviderProfileService } from '../../services/providerprofile.service';

import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';


@Component({
    selector: 'providereditprofile',
    templateUrl: './providereditprofile.component.html',
    styleUrls: ['./providereditprofile.component.css']
})

export class ProviderEditProfileComponent {
    
    public url: string;
    public url3: string;
    public auth: any;
    public ob: any;         // HTTP response object
    private status = -1;    // Disables creation notification messages
    
    // API return objects
    providerProfile: ProviderProfileToEdit; 

    // API call to get a list of possible skills
    allSkills: Skills;
    public url4: string;

    // Form related variables
    rForm: FormGroup; // An object for our submitted form
    updatedProviderProfile: UpdatedProviderProfile = {};

    // Provider Profile cache (injected Singleton populated in the ProviderDashboard)
    public providerProfileCached: ProviderProfileService;

    // Alert texts;
    nameAlert: string = 'You must specify your Name thats between 2 and 50 characters'

    // Map related variables
    zoom: number = 15;
    centerLocationLat: number = 51.497325; //Science museum coordinates
    centerLocationLng: number = -0.173927;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;
    defaultUI: boolean = false;
    draggable: boolean = false

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

    // Options for the car selector
    haveAcarBool: boolean = false;
    haveAcarString: string;
    haveAcarOptions: string[];
 

    constructor(private fb: FormBuilder,
                authService: AuthService,
                providerProfile: ProviderProfileService,
                @Inject('API_URL2') apiUrl: string,
                private router: Router,
                private http: Http) {
        
 
        this.url = apiUrl + 'getproviderprofile';         // GET selected job details
        this.url2 = apiUrl                              // For the File Upload URL
        this.url3 = apiUrl + 'editproviderprofile';       // POST edited job details
        this.url4 = apiUrl + 'getskills';               // GET all possible skills
        this.auth = authService;    // inserts JWT into the HTTP requests, it's basically a wrapper'

        // Reads Provider Profile cache
        this.providerProfileCached = providerProfile;

        // Setup fields in the FormBuilder
        this.rForm = fb.group({
            'name': [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'surname': [null, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'contactEmail': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(50), Validators.pattern(this.regexValidators.email)])],
            'contactTelephone1': [null, Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            'contactTelephone2': [null, Validators.compose([Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            //'haveAcar': [null, Validators.compose([Validators.required])],

            'validate': ''
        });
        
        // GET request to the API to retrieve job details
        this.auth.get(this.url)
            .subscribe(result => {
                this.providerProfile = result.json() as ProviderProfileToEdit;

                // Populate form with received data
                this.rForm.patchValue({
                    name: this.providerProfile.name,
                    surname: this.providerProfile.surname,
                    contactEmail: this.providerProfile.contactEmail,
                    contactTelephone1: this.providerProfile.contactTelephone1,
                    contactTelephone2: this.providerProfile.contactTelephone2,
                    //haveAcar: this.providerProfile.haveAcar,
                    //city: this.providerProfile.city,
                    //postCode: this.providerProfile.postCode,
                    locationLat: this.providerProfile.locationLat,
                    locationLng: this.providerProfile.locationLng,

                    profileImage: this.providerProfile.profileImageUrl
                });

                // Map 
                this.locationLat = this.providerProfile.locationLat;
                this.locationLng = this.providerProfile.locationLng;
                this.centerLocationLat = this.providerProfile.locationLat;
                this.centerLocationLng = this.providerProfile.locationLng;

                // Have A Car - set a drop down value (doesnot work)
                if (this.providerProfile.haveAcar) {
                    this.haveAcarString = "Yes";
                    this.haveAcarOptions = ["Yes", "No"];   // this is a workaround to show current value correctly
                    //console.log("Have1 a car: " + this.haveAcarString);
                }
                else {
                    this.haveAcarString = "No";
                    this.haveAcarOptions = ["No", "Yes"];   // this is a workaround to show current value correctly
                    //console.log("Have2 a car: " + this.haveAcarString);
                }

            },
            (err) => {
                if (err === 'Unauthorized') {
                    console.log('Unauthorized, Redirecting....');
                    // Redirect to unauthorized route (it's defined in the app.module.shared.ts)
                    this.router.navigate(['/unauthorized']);
                }
            }
        );

        // GET request to the API to retrieve all skills
        this.auth.get(this.url4)
            .subscribe(result => {
                this.allSkills = result.json() as Skills;
                
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

    // Car selection method
    selectHaveACar(haveAcarString: string) {
        if (haveAcarString == "Yes") {
            this.haveAcarBool = true;
            //console.log("Have1 a car: " + this.haveAcarBool);
        }
        else {
            this.haveAcarBool = false;
            //console.log("Have2 a car: " + this.haveAcarBool);
        }
    }

    // POST the form to WEBAPI
    editProviderProfile(formdata) {
        console.log("Name from the form: " + formdata.name);

        // Prepare the JSON body message
        this.updatedProviderProfile.name = formdata.name;
        this.updatedProviderProfile.surname = formdata.surname;
        this.updatedProviderProfile.contactEmail = formdata.contactEmail;
        this.updatedProviderProfile.contactTelephone1 = formdata.contactTelephone1;
        this.updatedProviderProfile.contactTelephone2 = formdata.contactTelephone2;
        this.updatedProviderProfile.profileImageUrl = this.providerProfile.profileImageUrl;
        this.updatedProviderProfile.haveAcar = this.haveAcarBool;
        this.updatedProviderProfile.locationLat = this.locationLat;
        this.updatedProviderProfile.locationLng = this.locationLng;
        this.updatedProviderProfile.skills = this.providerProfile.skills;

        // Update cached Provider Profile
        this.providerProfileCached.Profile.contactTelephone1 = formdata.contactTelephone1;
        console.log(this.providerProfileCached.Profile.contactTelephone1);
        console.log(this.providerProfileCached.Profile.telephone1Verified);

        // Convert into JSON
        let body = JSON.stringify(this.updatedProviderProfile);
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

    // Custom Email Validator - not is use (instead pattern matching is used above)
    validateEmail(c: FormControl) {
        let EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        return EMAIL_REGEXP.test(c.value) ? null : {
            validateEmail: {
                valid: false
            }
        };
    }
    
    // Click on map to create a marker
    mapClicked($event: any) {
        this.locationLat = $event.coords.lat; //Science museum coordinates
        this.locationLng = $event.coords.lng;

        console.log("Lat: " + this.locationLat + ", Lng: " + this.locationLng);
    }

    // Skill adding function
    addNewSkill(newSkill) {
        console.log("Adding a new skill - " + newSkill);

        if (this.providerProfile.skills.indexOf(newSkill) == -1){
            this.providerProfile.skills = this.providerProfile.skills.concat(newSkill);
        }
    }

    // Skill removing funtion
    removeSkill(skill) {
        console.log("Deleting a skill - " + skill);
        var index = this.providerProfile.skills.indexOf(skill);
        this.providerProfile.skills.splice(index, 1);
    }

    // Zoom into modal window selected image
    setSelectedImage(image) {
        this.selectedImage = image;
    }

    // Delete an image
    removeProfileImage() {
        this.providerProfile.profileImageUrl = null;
        console.log("Deleting the image: " + this.providerProfile.profileImageUrl);
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
                            this.providerProfile.profileImageUrl = data.image;
                            this.uploading = true;
                            console.log("Uploaded Image: " + this.providerProfile.profileImageUrl);
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


interface ProviderProfileToEdit {
    id?: number,
    name?: string,
    surname?: string,
    username?: string,
    //addressId: string,
    //haveAcar: boolean,
    //isClient: boolean,
    //isProvider: boolean,
    //lastLoginTime?: Date,

    contactEmail?: string,
    contactTelephone1?: string,
    contactTelephone2?: string,
    profileImageUrl?: string,
    haveAcar?: boolean,
    locationLat?: number,
    locationLng?: number,

    //country?: string,
    //city?: string,
    //adressLine1?: string,
    //adressLine2?: string,
    //postCode?: string,

    skills?: string[]
};

interface UpdatedProviderProfile {
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
    haveAcar?: boolean,
    locationLat?: number,
    locationLng?: number,

    //country: string,
    //city: string,
    //adressLine1: string,
    //adressLine2: string,
    //postCode: string
    
    skills?: string[]
};


interface Skills {
    skills?: string[]
}
