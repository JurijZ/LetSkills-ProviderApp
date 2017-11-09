import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';

@Injectable()
export class ProviderDashboardStateService {
    isOfferedCollapse?: boolean = false;
    isAcceptedCollapse?: boolean = false;
    isAppliedCollapse?: boolean = false;
    isCompletedCollapse?: boolean = false;
}


