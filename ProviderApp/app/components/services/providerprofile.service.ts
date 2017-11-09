import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';

@Injectable()
export class ProviderProfileService {
    public Profile: ProviderProfile;

    getProviderprofile() {
        return this.Profile;
    }
};

// External object is used to mace the service behave as a Singleton (to use as Cache)
export class ProviderProfile {
    id?: number;
    name?: string;
    surname?: string;
    username?: string;
    //addressId: string;
    //haveAcar: boolean;
    //isClient: boolean;
    //isProvider: boolean;
    //lastLoginTime : Date;

    contactEmail?: string;
    contactTelephone1?: string;
    contactTelephone2?: string;
    profileImageUrl?: string;
    haveAcar?: boolean;
    locationLat?: number;
    locationLng?: number;
    telephone1Verified?: string;

    //country?: string;
    //city?: string;
    //adressLine1?: string;
    //adressLine2?: string;
    //postCode?: string;

    skills?: string[];
    //skillsFullList?: string[];     // GET request to GetProviderProfile returns full skil list by default. This is done for edit, but as a side effect gets to this component as well. Rethinking is needed here

}
