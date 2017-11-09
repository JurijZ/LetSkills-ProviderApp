import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthModule } from 'angular-auth-oidc-client'; // JWT
import { AgmCoreModule } from '@agm/core'; // Google maps
import { MyDatePickerModule } from 'mydatepicker'; // Calendar

import { AppComponent } from './components/app/app.component'
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { MyJobsComponent } from './components/client/myjobs/myjobs.component';
import { JobDetailsComponent } from './components/client/jobdetails/jobdetails.component';
import { NewJobComponent } from './components/client/newjob/newjob.component';
import { EditJobComponent } from './components/client/editjob/editjob.component';
import { ClientDashboardComponent } from './components/client/clientdashboard/clientdashboard.component';
import { ClientProfileComponent } from './components/client/clientprofile/clientprofile.component';
import { ClientWalletComponent } from './components/client/clientwallet/clientwallet.component';
import { ClientFeedbacksComponent } from './components/client/clientfeedbacks/clientfeedbacks.component';
import { ClientExistingFeedbackComponent } from './components/client/clientexistingfeedback/clientexistingfeedback.component';
import { ClientNewFeedbackComponent } from './components/client/clientnewfeedback/clientnewfeedback.component';
import { VerifyTelNumberComponent } from './components/client/verifytelnumber/verifytelnumber.component';
import { OfferProviderDetailsComponent } from './components/client/offerproviderdetails/offerproviderdetails.component';
import { ProviderDetailsComponent } from './components/client/providerdetails/providerdetails.component';
import { ApplicationsComponent } from './components/client/applications/applications.component';
import { EditClientProfileComponent } from './components/client/editclientprofile/editclientprofile.component';
import { ProviderDashboardComponent } from './components/provider/providerdashboard/providerdashboard.component';
import { ProviderProfileComponent } from './components/provider/providerprofile/providerprofile.component';
import { ProviderEditProfileComponent } from './components/provider/providereditprofile/providereditprofile.component';
import { ProviderJobDetailsComponent } from './components/provider/providerjobdetails/providerjobdetails.component';
import { SearchJobComponent } from './components/provider/searchjob/searchjob.component';

import { OnlyNumber } from './components/shared/onlynumber.directive';

import { EnvironmentConfig } from './components/environments';

import { AuthService } from './components/services/auth.service';
import { PaginationService } from './components/services/pagination.service';
import { SearchParametersService, SearchStateService, SearchResultsService } from './components/services/search.service';
import { ClientDashboardStateService } from './components/services/clientdashboard.service';
import { ProviderDashboardStateService } from './components/services/providerdashboard.service';
import { ProviderProfileService } from './components/services/providerprofile.service';

export const sharedConfig: NgModule = {
    bootstrap: [ AppComponent ],
    declarations: [ 
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        UnauthorizedComponent,
        MyJobsComponent,
        JobDetailsComponent,
        NewJobComponent,
        EditJobComponent,
        ClientDashboardComponent,
        ClientProfileComponent,
        ClientWalletComponent,
        ClientFeedbacksComponent,
        ClientExistingFeedbackComponent,
        ClientNewFeedbackComponent,
        VerifyTelNumberComponent,
        OfferProviderDetailsComponent,
        ProviderDetailsComponent,
        ApplicationsComponent,
        EditClientProfileComponent,
        ProviderDashboardComponent,
        ProviderProfileComponent,
        ProviderEditProfileComponent,
        ProviderJobDetailsComponent,
        SearchJobComponent,
        OnlyNumber
    ],
    imports: [
        MyDatePickerModule,
        AuthModule.forRoot(),
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'unauthorized', component: UnauthorizedComponent },
            { path: 'newjob', component: NewJobComponent },
            { path: 'myjobs', component: MyJobsComponent },
            { path: 'jobdetails/:id', component: JobDetailsComponent },
            { path: 'editjob/:id', component: EditJobComponent },
            { path: 'clientdashboard', component: ClientDashboardComponent },
            { path: 'clientprofile', component: ClientProfileComponent },
            { path: 'clientwallet', component: ClientWalletComponent },
            { path: 'clientfeedbacks', component: ClientFeedbacksComponent },
            { path: 'clientexsitingfeedback', component: ClientExistingFeedbackComponent },
            { path: 'clientnewfeedback/:jobid/:providerid', component: ClientNewFeedbackComponent },
            { path: 'verifytelnumber', component: ClientNewFeedbackComponent },
            { path: 'offerproviderdetails/:id', component: OfferProviderDetailsComponent },
            { path: 'providerdetails/:providerid/:jobid', component: ProviderDetailsComponent },
            { path: 'applications/:id', component: ApplicationsComponent },
            { path: 'editclientprofile', component: EditClientProfileComponent },
            { path: 'providerdashboard', component: ProviderDashboardComponent },
            { path: 'providerprofile', component: ProviderProfileComponent },
            { path: 'providereditprofile', component: ProviderEditProfileComponent },
            { path: 'providerjobdetails/:id', component: ProviderJobDetailsComponent },
            { path: 'searchjob', component: SearchJobComponent },
            { path: '**', redirectTo: 'providerdashboard' }
        ]),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDWlVCMq5pmmqJoSiRdXp8WEY6ffXOIrA8'   // Google Maps API key
        })
    ],
    providers: [ 
        AuthService,                                                    // Injection as a Singleton
        PaginationService,                                              // Injection as a Singleton
        SearchParametersService,                                        // Injection as a Singleton from search service
        SearchStateService,                                             // Injection as a Singleton from search service
        SearchResultsService,                                           // Injection as a Singleton from search service
        ClientDashboardStateService,                                    // Injection as a Singleton from client dashboard service
        ProviderDashboardStateService,                                  // Injection as a Singleton from provider dashboard service
        ProviderProfileService,                                         // Injection as a Singleton from provider profile service
        //{ provide: 'API_URL', useValue: "http://localhost:5001/api/" }, // Injection as a Value
        //{ provide: 'API_URL2', useValue: "http://localhost:5004/api/" } // Injection as a Value
        { provide: 'API_URL2', useValue: EnvironmentConfig.let_skills_backend_url } // Injection as a Value
    ]
};
