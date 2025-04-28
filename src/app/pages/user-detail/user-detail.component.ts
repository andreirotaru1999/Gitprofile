import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GitHubService } from '../../services/github.service';
import { User } from '../../shared/models/user.model';
import { Repo } from '../../shared/models/repo.model';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit {
  username!: string;
  user!: User;
  repos: Repo[] = [];
  loading = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gitHubService: GitHubService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const state = history.state as { user?: User };

    if (state?.user) {
      this.user = state.user;

      this.gitHubService.getUserReposByUrl(this.user.repos_url).subscribe({
        next: (repos) => {
          this.repos = repos;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load user repositories.';
          console.error(err);
          this.loading = false;
        },
      });
    } else {
      const username = this.route.snapshot.paramMap.get('username')!;

      this.gitHubService.getUserDetails(username).subscribe({
        next: (user) => {
          this.user = user;

          this.gitHubService.getUserReposByUrl(user.repos_url).subscribe({
            next: (repos) => {
              this.repos = repos;
              this.loading = false;
            },
            error: (err) => {
              this.errorMessage = 'Failed to load user repositories.';
              console.error(err);
              this.loading = false;
            },
          });
        },
        error: (err) => {
          this.errorMessage = 'Failed to load user details.';
          console.error(err);
          this.loading = false;
        },
      });
    }
  }
  goBack(): void {
    this.location.back();
  }
}
