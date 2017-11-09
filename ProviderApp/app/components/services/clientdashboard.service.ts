import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';

@Injectable()
export class ClientDashboardStateService {
    IsOnHoldCollapse?: boolean = false;
    IsPublishedCollapse?: boolean = false;
    IsExpiredCollapse?: boolean = false;
    IsInProgpressCollapse?: boolean = false;
    IsCompletedCollapse?: boolean = false;
}


