import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';

@Injectable()
export class SearchResultsService {
    public Results: SearchResults[];

    getData() {
        return this.Results;
    }
}

export class SearchResults {
    id?: number;
    clientId?: number;
    jobTitle?: string;
    ratePerHour?: number;
    rateFixed?: number;
    durationDays?: number;
    durationHours?: number;
    jobState?: number;
    plannedStartDate?: string;
    plannedFinishDate?: string;
    locationLat?: number;
    locationLng?: number;
    skill?: string;
    jobDescription?: string;
    applied?: number;
    images?: string[];
}

@Injectable()
export class SearchStateService {
    SearchVisible?: number = 1;
    SearchResultsVisible?: number = 0;
    SearchTypeVisible?: string = 'map';
    SearchCurrentPage?: number = 1;
}

@Injectable()
export class SearchParametersService {
    Keywords?: string;
    LocationLat?: number;
    LocationLng?: number;
    Radius?: number;
    Zoom?: number;
    Skill?: string;
    Duration?: number;
}
