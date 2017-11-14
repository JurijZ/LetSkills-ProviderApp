import { Component, Inject, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'verifytelnumber',
    templateUrl: './verifytelnumber.component.html',
    styleUrls: ['./verifytelnumber.component.css']
})
export class VerifyTelNumberComponent implements OnChanges {

    rForm: FormGroup;
    post: any;                     // A property for our submitted form
        
    public url: string;
    public auth: any;
    public ob: any;
    private verificationStatus = -1;    // Disables creation notification messages

    verificationCode: VerificationCoode = {};  
    @Input() reloader: number;    // telephone number to be checked
    @Input() tel_number: string;    // telephone number to be checked
    @Input() job_id: number;        // job to which the number is linked
    @Output() verifiedtelnumber: EventEmitter<string> = new EventEmitter<string>();
        
    constructor(private fb: FormBuilder,
            authService: AuthService,
            @Inject('API_URL2') apiUrl: string,
            private router: Router,
            private http: Http,
            private route: ActivatedRoute) {
        
        this.url = apiUrl + 'VerifySMSCode';
        this.auth = authService;                        // inserts JWT and implements HTTP methods

        // Setup fields in the FormBuilder
        this.rForm = fb.group({
            'code': [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(4)])],
            'validate': ''
        });
    }

    //ngAfterViewInit() {
    //    console.log("AfterViewInit executed");
    //}

    //ngAfterViewChecked() {
    //    console.log("AfterViewChecked executed");
    //    //this.verificationStatus = -1;        
    //}

    ngOnChanges() {
        console.log("OnChanges executed");

        // Clear the form from preveous values
        this.rForm.patchValue({ code: null })
        this.verificationStatus = -1;
    }
            
    // POST Verification Code to WEBAPI to check for validity
    submitVerificationCode(formdata) {
        // Prepare the JSON body message
        this.verificationCode.code = formdata.code;
        this.verificationCode.telnumber = this.tel_number;
        this.verificationCode.jobid = this.job_id;

        let body = JSON.stringify(this.verificationCode);
        console.log("Body to send" + body);

        // POST it to the server
        return this.ob = this.auth.post(this.url, body) //JSON.stringify({ Name: name })
            .subscribe(
            result => {
                console.log(result);
                this.verificationStatus = 1;    // Shows Success message
                this.verifiedtelnumber.emit(this.tel_number); // Return binded variable to the parrent (jobdetails)
            },
            err => {
                console.log('ERROR:');
                console.log(err);
                this.verificationStatus = 0;    // Shows Failure message
            }
            );
    }    
}

interface VerificationCoode {
    code?: string;
    telnumber?: string;
    jobid?: number;
}
