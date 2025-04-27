import { Component, OnInit } from '@angular/core';
import { GitHubService } from '../../services/github.service';
import { User } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-users-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  since: number = 0;
  nextSince: number = 0;
  perPage: number = 10;
  pageNumber = 1;
  loading: boolean = false;
  selectedTab: string = 'pagination';
  history: number[] = [];
  errorMessage: string = '';


  constructor(private gitHubService: GitHubService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(since: number = 0, triggeredByScroll: boolean = false): void {
    this.loading = true;
    this.errorMessage = '';

  
    if (this.selectedTab === 'pagination') {
      this.gitHubService.getUsers(since, this.perPage).subscribe({
        next: response => {
          this.users = response.users;
          this.nextSince = response.nextSince ?? 0;
          this.loading = false;
        },
        error: err => {
          this.errorMessage = 'Failed to load users. Please try again.';
          this.loading = false;
        }
      });
    } else if (this.selectedTab === 'infinite') {
      this.gitHubService.getUsers(since, this.perPage).subscribe({
        next: response => {
          this.users = [...this.users, ...response.users];
          this.nextSince = response.nextSince ?? 0;
          this.loading = false;
        },
        error: err => {
          this.errorMessage = 'Failed to load more users. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  checkIfMoreUsersNeeded(): void {
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;
  
    if (scrollContainer && scrollContainer.scrollHeight <= scrollContainer.clientHeight && !this.loading) {
      this.since = this.nextSince ?? 0;
      this.fetchUsers(this.since, true);
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
      const previousSince = this.history.pop();
      if (previousSince !== undefined) {
        this.since = previousSince;
      }
      this.fetchUsers(this.since);
      this.pageNumber--;
    }
  }

  goToFirstPage(): void {
    this.since = 0;
    this.history = [];
    this.pageNumber = 1;
    this.fetchUsers(this.since);
  }

  @HostListener('window:scroll', [])
  onScroll(event?: any): void {
    const element = event?.target || document.scrollingElement || document.documentElement;
  
    const threshold = 200; // px before bottom to trigger load
  
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + threshold && !this.loading) {
      this.since = this.nextSince ?? 0;
      this.fetchUsers(this.since, true); // true = triggered by scroll
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
