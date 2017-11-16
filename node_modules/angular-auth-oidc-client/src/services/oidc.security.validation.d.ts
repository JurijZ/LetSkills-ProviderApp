import { OidcSecurityCommon } from './oidc.security.common';
export declare class OidcSecurityValidation {
    private oidcSecurityCommon;
    constructor(oidcSecurityCommon: OidcSecurityCommon);
    isTokenExpired(token: string, offsetSeconds?: number): boolean;
    validate_id_token_exp_not_expired(decoded_id_token: string, offsetSeconds?: number): boolean;
    validate_required_id_token(dataIdToken: any): boolean;
    validate_id_token_iat_max_offset(dataIdToken: any, max_offset_allowed_in_seconds: number): boolean;
    validate_id_token_nonce(dataIdToken: any, local_nonce: any): boolean;
    validate_id_token_iss(dataIdToken: any, authWellKnownEndpoints_issuer: any): boolean;
    validate_id_token_aud(dataIdToken: any, aud: any): boolean;
    validateStateFromHashCallback(state: any, local_state: any): boolean;
    validate_userdata_sub_id_token(id_token_sub: any, userdata_sub: any): boolean;
    getPayloadFromToken(token: any, encode: boolean): any;
    getHeaderFromToken(token: any, encode: boolean): any;
    getSignatureFromToken(token: any, encode: boolean): any;
    validate_signature_id_token(id_token: any, jwtkeys: any): boolean;
    config_validate_response_type(response_type: string): boolean;
    validate_id_token_at_hash(access_token: any, at_hash: any): boolean;
    private generate_at_hash(access_token);
    private getTokenExpirationDate(dataIdToken);
    private urlBase64Decode(str);
}
