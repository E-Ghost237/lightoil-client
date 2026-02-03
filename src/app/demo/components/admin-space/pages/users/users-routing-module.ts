import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import { AddUsersComponent } from './add-users/add-users.component';
import { ListUsersComponent } from './list-users/list-users.component';


@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      { path: '', component: UsersComponent,
        children: [
            {path: 'list-users', component: ListUsersComponent },
            {path: 'add-users', component: AddUsersComponent},
            {path: '', redirectTo: 'list-users', pathMatch: 'full'}
        ]
       }
    ])
  ],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
