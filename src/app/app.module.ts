import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./components/login/login.component";
import { EditorComponent } from "./components/editor/editor.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { AuthGuard } from "./guards/auth.guard";
import { ViewletterComponent } from './components/viewletter/viewletter.component';
// import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EditorComponent,
    DashboardComponent,
    ViewletterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
