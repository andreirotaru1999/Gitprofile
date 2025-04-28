import { Component, OnInit } from '@angular/core';
import { GitHubService } from '../../services/github.service';
import { User } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HostListener } from '@angular/core';
import { take } from 'rxjs';
import { PaginationType } from '../../shared/models/constants/paginationType.enum';
import { DEFAULT_PER_PAGE, FIRST_SINCE } from '../../shared/models/constants/app.constants';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    RouterModule,
    MatSlideToggleModule,
    MatButtonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  since: number = 0;
  nextSince: number = FIRST_SINCE;
  perPage: number = DEFAULT_PER_PAGE;
  pageNumber = 1;
  loading: boolean = false;
  selectedTab: PaginationType = PaginationType.Pagination;
  history: number[] = [];
  errorMessage: string = '';
  paginationType = PaginationType;


  constructor(private gitHubService: GitHubService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(since: number = 0, triggeredByScroll: boolean = false): void {
    this.loading = true;
    this.errorMessage = '';
    this.gitHubService.getUsers(since, this.perPage).pipe(take(1)).subscribe({
      next: response => {
        if (this.selectedTab === PaginationType.Pagination) {
          this.users = response.users;
        }
        if (this.selectedTab === PaginationType.Infinite) {
          this.users = [...this.users, ...response.users];
          if (!triggeredByScroll) {
            setTimeout(() => this.checkIfMoreUsersNeeded(), 0);
          }
        }
        this.nextSince = response.nextSince ?? 0;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Failed to load users. Please try again.';
        console.error('Error fetching users:', err);
        this.loading = false;
      }
    });
  }

  checkIfMoreUsersNeeded(): void {
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;
    const areMoreUsersNeeded = scrollContainer && scrollContainer.scrollHeight <= scrollContainer.clientHeight;
    if (areMoreUsersNeeded && !this.loading) {
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
  
    const threshold = 200; 
  
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + threshold && !this.loading && this.selectedTab === PaginationType.Infinite) {
      this.since = this.nextSince ?? 0;
      this.fetchUsers(this.since, true);
    }
  }

  onToggleChange(event: MatSlideToggleChange): void {
    this.selectedTab = event.checked ? PaginationType.Infinite : PaginationType.Pagination;
    this.users = [];
    this.since = 0;
    this.history = [];
    this.fetchUsers();
  }
}