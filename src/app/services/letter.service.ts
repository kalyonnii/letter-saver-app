// src/app/services/letter.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Letter Interface for Type Safety
export interface Letter {
  _id?: string;
  title: string;
  content: string;
  user?: string;
  savedAt?: Date;
  driveFileId?: string;
  status?: 'draft' | 'saved' | 'archived';
}

// Letter Creation DTO
export interface CreateLetterDto {
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class LetterService {
  // Base API URL from environment
  private apiUrl = environment.apiUrl;

  // BehaviorSubject to manage letters list
  private lettersSubject = new BehaviorSubject<Letter[]>([]);
  letters$ = this.lettersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Create a new letter
  createLetter(letterData: CreateLetterDto): Observable<Letter> {
    return this.http.post<Letter>(`${this.apiUrl}/api/letters`, letterData).pipe(
      tap(newLetter => {
        // Update letters list
        const currentLetters = this.lettersSubject.value;
        this.lettersSubject.next([...currentLetters, newLetter]);
      }),
      catchError(this.handleError<Letter>('createLetter'))
    );
  }

  // Get all letters for the current user
  fetchLetters(filters?: {
    status?: 'draft' | 'saved' | 'archived',
    limit?: number,
    page?: number
  }): Observable<Letter[]> {
    // Create HttpParams for filtering
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
    }

    return this.http.get<Letter[]>(`${this.apiUrl}/api/letters`, { params }).pipe(
      tap(letters => {
        this.lettersSubject.next(letters);
      }),
      catchError(this.handleError<Letter[]>('fetchLetters', []))
    );
  }

  // Get a specific letter by ID
  getLetterById(letterId: string): Observable<Letter> {
    return this.http.get<Letter>(`${this.apiUrl}/api/letters/${letterId}`).pipe(
      catchError(this.handleError<Letter>(`getLetterById id=${letterId}`))
    );
  }

  // Update an existing letter
  updateLetter(letterId: string, letterData: Partial<Letter>): Observable<Letter> {
    return this.http.patch<Letter>(`${this.apiUrl}/api/letters/${letterId}`, letterData).pipe(
      tap(updatedLetter => {
        // Update letters list
        const currentLetters = this.lettersSubject.value;
        const updatedLetters = currentLetters.map(letter =>
          letter._id === updatedLetter._id ? updatedLetter : letter
        );
        this.lettersSubject.next(updatedLetters);
      }),
      catchError(this.handleError<Letter>('updateLetter'))
    );
  }


  // Delete a letter
  deleteLetter(letterId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/letters/${letterId}`).pipe(
      tap(() => {
        // Remove letter from list
        const currentLetters = this.lettersSubject.value;
        const filteredLetters = currentLetters.filter(letter => letter._id !== letterId);
        this.lettersSubject.next(filteredLetters);
      }),
      catchError(this.handleError<any>('deleteLetter'))
    );
  }

  // Save letter to Google Drive
  saveLetterToDrive(letterId: string): Observable<{
    message: string,
    driveFileId: string
  }> {
    return this.http.post<{message: string, driveFileId: string}>(
      `${this.apiUrl}/api/letters/${letterId}/drive`,
      {}
    ).pipe(
      tap(response => {
        // Update letter with Drive file ID
        const currentLetters = this.lettersSubject.value;
        const updatedLetters = currentLetters.map(letter =>
          letter._id === letterId
            ? {...letter, driveFileId: response.driveFileId}
            : letter
        );
        this.lettersSubject.next(updatedLetters);
      }),
      catchError(this.handleError<any>('saveLetterToDrive'))
    );
  }

  // Get letters saved to Drive
  fetchDriveLetters(): Observable<Letter[]> {
    return this.http.get<Letter[]>(`${this.apiUrl}/api/letters/drive`).pipe(
      catchError(this.handleError<Letter[]>('fetchDriveLetters', []))
    );
  }

  // Error handling utility
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // Log error to console
      console.error(`${operation} failed: ${error.message}`);

      // Return a safe result to keep the app running
      return new Observable<T>(observer => {
        observer.error(error);
      });
    };
  }

  // Getter for current letters
  getCurrentLetters(): Letter[] {
    return this.lettersSubject.value;
  }
}
