import { Component, Inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

import { IMyDpOptions, IMyDateModel, IMyDate, IMyInputFocusBlur } from 'mydatepicker';

@Component({
    selector: 'newjob',
    templateUrl: './newjob.component.html',
    styleUrls: ['./newjob.component.css']
})
export class NewJobComponent {

    rForm: FormGroup;
    post: any;                     // A property for our submitted form

    //description: string = '';
    name: string = '';
    jobtitle: string = '';
    rateperhour: number = 0;
    rate_rb_value: number;
    duration_rb_value: number;
    
    //titleAlert: string = 'This field is required';
    jobtitleAlert: string = 'Please specify a Title thats between 5 and 50 characters'

    // File upload variables
    private isUploadBtn: boolean = true; 
    uploading: boolean = true; 
    imageCountValidation: boolean = true;
    myFile: File; /* property of File type */
    selectedImage;

    public url: string;
    public url2: string;
    public url3: string;
    public auth: any;
    public ob: any;
    private status = -1;    // Disables creation notification messages

    newjob: NewJob = {};

    // Client Limits
    clientLimits: ClientLimits;
    alowedToPublish: boolean;
    maxJobsAllowed: number;

    // API call to get a list of possible skills
    skill: string;
    selectedSkill: string;
    allSkills: Skills;
    public url4: string;

    // Configure calendar
    public myDatePickerOptions: IMyDpOptions = {
        // other options...
        dateFormat: 'dd mmm yyyy',
        editableDateField: false,
        openSelectorOnInputClick: true,
        disableUntil: this.currentDate(),
        disableSince: this.finalDate()
    };
    private startDate: IMyDate = this.currentDate(); // To populate calendars Start Date field
    private finishDate: IMyDate = this.currentDate(); // To populate calendars Finish Date field
    plannedStartDate_CSCompatible: string;
    plannedFinishDate_CSCompatible: string;    

    // Map related variables
    zoom: number = 10;
    centerLocationLat: number = 51.497325; //Science museum coordinates
    centerLocationLng: number = -0.173927;
    locationLat: number = 51.497325; //Science museum coordinates
    locationLng: number = -0.173927;
    defaultUI: boolean = false;
    draggable: boolean = false

    // Job State
    create_job_rb_value: number;
    jobState: number = 10; // 10 - Create and Pubish, 0 - Create only

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

        this.url = apiUrl + 'CreateJob';
        this.url2 = apiUrl                              // For the File Upload URL
        this.url3 = apiUrl + 'GetClientLimits'          // Get current client limits
        this.url4 = apiUrl + 'getskills';               // GET all possible skills
        this.auth = authService;                        // inserts JWT and implements HTTP methods
        
        // Setup fields in the FormBuilder
        this.rForm = fb.group({
            'jobTitle': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50)])],
            'jobDescription': [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(400)])],

            'rate_rb': ['0', Validators.required],  // radio button control
            'rateFixed': [ null, Validators.required],            
            'ratePerHour': [{ value: null, disabled: true }, Validators.required],

            'duration_rb': ['0', Validators.required],  // radio button control
            'durationDays': [null, Validators.required],
            'durationHours': [{ value: null, disabled: true }, Validators.required],

            'create_job_rb': ['0', Validators.required],  // job creation radio button control

            //'locationPostCode': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(10)])],
            'contactTelephone1': [null, Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            'contactTelephone2': [null, Validators.compose([Validators.minLength(7), Validators.maxLength(20), Validators.pattern(this.regexValidators.phone)])],
            //'contactEmail': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(50), Validators.pattern(this.regexValidators.email)])],

            'plannedStartDate': ['', Validators.required],
            'plannedFinishDate': ['', Validators.required],

            'skill': ['', Validators.required],
            'validate': ''
        });

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

        // GET request to the API to retrieve Client Limits
        this.auth.get(this.url3)
            .subscribe(result => {
                this.clientLimits = result.json() as ClientLimits;

                this.alowedToPublish = this.clientLimits.allowed;
                this.maxJobsAllowed = this.clientLimits.maxjobsallowed;
                console.log("Maximum Jobs allowed: " + this.clientLimits.maxjobsallowed);
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
    
    ngOnInit() {
    }

    ngAfterViewInit() {

        // Set Calendar values after the rendering is finished
        let sd: Date = new Date();
        this.startDate = {
            year: sd.getFullYear(),
            month: sd.getMonth() + 1,
            day: sd.getDate()
        };
        this.plannedStartDate_CSCompatible = this.startDate.year + '-' + this.startDate.month + '-' + this.startDate.day;
        //console.log(this.startDate);

        let fd: Date = new Date();
        this.finishDate = {
            year: fd.getFullYear(),
            month: fd.getMonth() + 1,
            day: fd.getDate()
        };
        this.plannedFinishDate_CSCompatible = this.finishDate.year + '-' + this.finishDate.month + '-' + this.finishDate.day;
        //console.log(this.finishDate);
    }
    
    onStartDateChanged(event: IMyDateModel) {
        this.plannedStartDate_CSCompatible = event.date.year + '-' + event.date.month + '-' + event.date.day;

        console.log('jsdate: ', new Date(event.jsdate).toLocaleDateString());
        console.log(event.date.year + '-' + event.date.month + '-' + event.date.day);
    }

    onEndDateChanged(event: IMyDateModel) {
        this.plannedFinishDate_CSCompatible = event.date.year + '-' + event.date.month + '-' + event.date.day;

        console.log('jsdate: ', new Date(event.jsdate).toLocaleDateString());
        console.log(event.date.year + '-' + event.date.month + '-' + event.date.day);
    }

    // Current Date
    currentDate(): any {
        let sd: Date = new Date();
        let currentDate = {
            year: sd.getFullYear(),
            month: sd.getMonth() + 1,
            day: sd.getDate()
        };

        return currentDate;
    }

    // 
    finalDate(): any {
        let sd: Date = new Date();
        sd.setDate(sd.getDate() + 10);  // Add X days
        let currentDate = {
            year: sd.getFullYear(),
            month: sd.getMonth() + 1,
            day: sd.getDate()
        };

        return currentDate;
    }

    // POST the form to WEBAPI
    createNewJob(formdata) {
        // Prepare the JSON body message
        this.newjob.JobTitle = formdata.jobTitle;
        this.newjob.JobDescription = formdata.jobDescription;
        this.newjob.RatePerHour = formdata.ratePerHour;
        this.newjob.RateFixed = formdata.rateFixed;
        this.newjob.DurationDays = formdata.durationDays;
        this.newjob.DurationHours = formdata.durationHours;
        //this.newjob.LocationPostCode = formdata.locationPostCode;
        this.newjob.ContactTelephone1 = formdata.contactTelephone1;
        this.newjob.ContactTelephone2 = formdata.contactTelephone2;
        //this.newjob.ContactEmail = formdata.contactEmail;
        this.newjob.JobState = this.jobState;
        this.newjob.PlannedStartDate = this.plannedStartDate_CSCompatible;
        this.newjob.PlannedFinishDate = this.plannedFinishDate_CSCompatible;
        this.newjob.LocationLat = this.locationLat;
        this.newjob.LocationLng = this.locationLng;
        this.newjob.Skill = this.selectedSkill;

        let body = JSON.stringify(this.newjob);
        console.log("Body to send" + body);

        // POST it to the server
        return this.ob = this.auth.post(this.url, body) //JSON.stringify({ Name: name })
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
        //.toPromise()
        //.then(res => res.json());
        //.then(response => { return response.json() });
        //.catch(this.handleError)
    }

    // Skill selection
    onChangeSkill(selectedSkill) {
        console.log(selectedSkill);
        this.selectedSkill = selectedSkill;
    }

    // Zoom into modal window selected image
    setSelectedImage(image) {
        this.selectedImage = image;
    }

    // Delete an image
    removeImageFromArray(image) {
        //console.log("Deleting an image: " + image);
        var index = this.newjob.Images.indexOf(image);
        this.newjob.Images.splice(index, 1);
    }
    
    // Upload images to Backend  
    fileChange(event) {
        //debugger; //To pause program execution at this point

        let fileList: FileList = event.target.files;

        // Ensures that the number of selected images is less then 4
        if (fileList.length > 0 && fileList.length <= 4) {

            //let file: File = fileList[0];
            this.imageCountValidation = true;
            let formData: FormData = new FormData();

            for (let file of Array.from(fileList)) {
                console.log(file.name);
                formData.append('Files', file, file.name);
            }

            let headers = new Headers()
            //headers.append('Content-Type', 'json');  
            //headers.append('Accept', 'application/json');  
            let options = new RequestOptions({ headers: headers });
            let fileUploadUrl = this.url2 + "UploadFiles";

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
                        if (this.newjob.Images == null){
                            setTimeout(() => {
                                this.newjob.Images = data.images;
                                this.uploading = true;
                                console.log(this.newjob.Images);
                            }, 3000);
                        }
                        else {
                            setTimeout(() => {
                                this.newjob.Images = this.newjob.Images.concat(data.images);
                                this.uploading = true;
                                console.log(this.newjob.Images);
                            }, 3000);
                        }
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

    // Click on map to create a marker
    mapClicked($event: any) {
        this.locationLat = $event.coords.lat; //Science museum coordinates
        this.locationLng = $event.coords.lng;

        console.log("Lat: " + this.locationLat + ", Lon: " + this.locationLng);
    }

    // Controls Job Creation radio buttons
    onCreateSelectionChange() {
        this.create_job_rb_value = this.rForm.get('create_job_rb').value;
        //console.log(this.create_rb_value);

        if (this.create_job_rb_value == 0) {
            this.jobState = 10;
        }
        if (this.create_job_rb_value == 1) {
            this.jobState = 0;
        }
    }

    // Controls Rate radio buttons
    onRateSelectionChange() {
        this.rate_rb_value = this.rForm.get('rate_rb').value;
        console.log(this.rate_rb_value);

        if (this.rate_rb_value == 0) {
            this.rForm.controls['rateFixed'].enable();
            this.rForm.controls['ratePerHour'].disable();

            this.rForm.patchValue({ ratePerHour: null });
        }
        if (this.rate_rb_value == 1) {
            this.rForm.controls['ratePerHour'].enable();
            this.rForm.controls['rateFixed'].disable();

            this.rForm.patchValue({ rateFixed: null });
        }
    }

    // Controls Duration radio buttons
    onDurationSelectionChange() {
        this.duration_rb_value = this.rForm.get('duration_rb').value;
        console.log(this.duration_rb_value);

        if (this.duration_rb_value == 0) {
            this.rForm.controls['durationDays'].enable();
            this.rForm.controls['durationHours'].disable();

            this.rForm.patchValue({ durationHours: null });
        }
        if (this.duration_rb_value == 1) {
            this.rForm.controls['durationHours'].enable();
            this.rForm.controls['durationDays'].disable();

            this.rForm.patchValue({ durationDays: null });
        }
    }
}

interface NewJob {
    JobTitle?: string;
    JobDescription?: string;
    RatePerHour?: number;
    RateFixed?: number;
    DurationDays?: number;
    DurationHours?: number;
    LocationPostCode?: string;
    ContactTelephone1?: string;
    ContactTelephone2?: string;
    ContactEmail?: string;
    JobState?: number; // Initial state will be populated automatically at the BackEnd
    PlannedStartDate?: string;
    PlannedFinishDate?: string;
    LocationLat?: number;
    LocationLng?: number;
    Skill?: string;
    Images?: string[];
}

interface Skills {
    skills?: string[];
}

// If the number of Published jobs is above the limit (usually 5 ) in the Client details creation is not allowed
interface ClientLimits {
    allowed?: boolean;
    maxjobsallowed?: number;
}