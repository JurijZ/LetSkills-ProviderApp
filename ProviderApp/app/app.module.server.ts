import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { sharedConfig } from './app.module.shared';

@NgModule({
    bootstrap: sharedConfig.bootstrap,
    declarations: sharedConfig.declarations,
    imports: [
        ServerModule,
        FormsModule,
        ReactiveFormsModule,
        ...sharedConfig.imports
    ],
    providers: [
        ...sharedConfig.providers
    ]
})
export class AppModule {
}
