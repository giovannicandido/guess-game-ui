import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SidebarModule } from "./sidebar/sidebar.module";
import { NavbarModule } from "./shared/navbar/navbar.module";
import { ToastrModule } from "ngx-toastr";
import { FooterModule } from "./shared/footer/footer.module";
import { FixedPluginModule } from "./shared/fixedplugin/fixedplugin.module";

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    FooterModule,
    FixedPluginModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
