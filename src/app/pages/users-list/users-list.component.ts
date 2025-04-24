import { Component, OnInit } from '@angular/core';
import { GitHubService } from '../../services/github.service';
import { User } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-users-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  since: number = 0;
  nextSince: number | undefined = undefined;
  perPage: number = 10;
  pageNumber = 1;
  loading: boolean = false;
  selectedTab: string = 'pagination';
  history: number[] = [];

  constructor(private gitHubService: GitHubService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(since: number = 0): void {
    this.loading = true;
    if (this.selectedTab === 'pagination') {

      this.gitHubService.getUsers(since, this.perPage).subscribe(response => {
        this.users = response.users;
        this.nextSince = response.nextSince ?? 0;
        this.loading = false;
      });
    } else {
      if (this.selectedTab === 'infinite') {
        this.gitHubService.getUsers(since, this.perPage).subscribe(response => {
          this.users = [...this.users, ...response.users];
          this.nextSince = response.nextSince ?? 0;
          this.loading = false;
        });
      }
    }
  }

  goToNextPage(): void {
    this.history.push(this.since);
    this.since = this.nextSince ?? 0;
    this.fetchUsers(this.nextSince);
    this.pageNumber++;
  }

  goToPreviousPage(): void {
    if (this.history.length > 0) {
      this.since = this.history.pop()!;
      this.fetchUsers(this.since);
      this.pageNumber--;
    }
  }

  goToFirstPage(): void {
    this.since = 0;
    this.history = [];
    this.fetchUsers(this.since);
  }

 onScroll(event: any): void {
  const element = event.target;
  if (element.scrollHeight - element.scrollTop === element.clientHeight) {
    this.since = this.nextSince ?? 0;
    this.fetchUsers(this.nextSince); 
  }
}

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.users = []; 
    this.since = 0;
    this.history = [];
    this.fetchUsers();
  }
}
