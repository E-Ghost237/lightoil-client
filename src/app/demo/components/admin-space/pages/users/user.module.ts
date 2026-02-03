import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { MessageModule } from "primeng/message";
import { MessagesModule } from "primeng/messages";
import { MultiSelectModule } from "primeng/multiselect";
import { TableModule } from "primeng/table";
import { ToastModule } from "primeng/toast";
import { ChatbotModule } from "../../../chatbot/chatbot.module";
import { SalesPerformancesRoutingModule } from "../sales-performances/sales-performances-routing.module";
import { ListUsersComponent } from "./list-users/list-users.component";
import { AddUsersComponent } from "./add-users/add-users.component";
import { UsersComponent } from "./users.component";
import { UsersRoutingModule } from "./users-routing-module";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TooltipModule } from "primeng/tooltip";
import { SpeedDialModule } from "primeng/speeddial";


@NgModule({
    declarations: [
        UsersComponent,
        ListUsersComponent,
        AddUsersComponent
    ],
    imports: [
    CommonModule,
    UsersRoutingModule,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    ChartModule,
    DividerModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    ButtonModule,
    MultiSelectModule,
    ChatbotModule,
    SalesPerformancesRoutingModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    TooltipModule,
    SpeedDialModule
]
})

export class UsersModule {

}