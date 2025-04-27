import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { User } from '../shared/models/user.model';
import { Repo } from '../shared/models/repo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GitHubService {
  private apiUrl = environment.apiUrl;
  private token = environment.gitHubToken;

  constructor(private http: HttpClient) {}

  getUsers(
    since: number = 0,
    per_page: number = 10,
  ): Observable<{ users: User[]; nextSince?: number }> {
    const url = `${this.apiUrl}/users?since=${since}&per_page=${per_page}`;
    const headers = new HttpHeaders({
      Authorization: `token ${this.token}`,
    });

    return this.http.get<User[]>(url, { observe: 'response', headers }).pipe(
      map((response: HttpResponse<User[]>) => {
        const users = response.body || [];
        const linkHeader = response.headers.get('Link');
        const nextSince = this.extractNextSince(linkHeader);
        return { users, nextSince };
      }),
      catchError(this.handleError('getUsers')),
    );
  }

  private extractNextSince(linkHeader: string | null): number | undefined {
    if (!linkHeader) return undefined;

    const links = linkHeader.split(',').map((part) => part.trim());
    for (const link of links) {
      const [urlPart, relPart] = link.split(';');
      if (relPart?.includes('rel="next"')) {
        const urlMatch = urlPart.match(/<(.+?)>/);
        if (urlMatch) {
          const url = new URL(urlMatch[1]);
          const since = url.searchParams.get('since');
          return since ? Number(since) : undefined;
        }
      }
    }
    return undefined;
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
