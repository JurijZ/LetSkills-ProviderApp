import { OidcSecurityCommon } from './oidc.security.common';
export declare class OidcSecuritySilentRenew {
    private oidcSecurityCommon;
    private sessionIframe;
    constructor(oidcSecurityCommon: OidcSecurityCommon);
    initRenew(): void;
    startRenew(url: string): any;
}
