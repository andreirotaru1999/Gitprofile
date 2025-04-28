import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { User } from '../shared/models/user.model';
import { Repo } from '../shared/models/repo.model';
import { environment } from '../../environments/environment';
import { DEFAULT_PER_PAGE, FIRST_SINCE } from '../shared/models/constants/app.constants';


@Injectable({
  providedIn: 'root',
})
export class GitHubService {
  private apiUrl = environment.apiUrl;
  private token = environment.gitHubToken;

  constructor(private http: HttpClient) {}

  getUsers(
    since: number = FIRST_SINCE,
    perPage: number = DEFAULT_PER_PAGE,
  ): Observable<{ users: User[]; nextSince?: number }> {
    const url = `${this.apiUrl}/users?since=${since}&per_page=${perPage}`;
    const headers = new HttpHeaders({
      Authorization: `token ${this.token}`,
    });

    return this.http.get<User[]>(url, { observe: 'response', headers }).pipe(
      map((response: HttpResponse<User[]>) => {
        const users = response.body || [];
        const nextSince = users[perPage - 1].id;
        return { users, nextSince };
      }),
      catchError(this.handleError('getUsers')),
    );
  }

  getUserDetails(username: string): Observable<User> {
    const headers = new HttpHeaders({ Authorization: `token ${this.token}` });
    return this.http
      .get<User>(`${this.apiUrl}/users/${username}`, { headers })
      .pipe(catchError(this.handleError('getUserDetails')));
  }

  getUserReposByUrl(url: string): Observable<Repo[]> {
    const headers = new HttpHeaders({ Authorization: `token ${this.token}` });
    return this.http
      .get<Repo[]>(url, { headers })
      .pipe(catchError(this.handleError('getUserReposByUrl')));
  }

  private handleError(operation: string) {
    return (error: any) => {
      console.error(`[GitHubService] Error during ${operation}:`, error);
      return throwError(
        () =>
          new Error(
            `Something went wrong during ${operation}. Please try again later.`,
          ),
      );
    };
  }
}
