import { Component, OnInit } from "@angular/core";
import { LetterService } from "../../services/letter.service";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

interface Letter {
  _id: string;
  title: string;
  content: string;
  savedAt: Date;
  status: "draft" | "saved" | "published";
  driveFileId?: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
  letters: Letter[] = [];
  filteredLetters: Letter[] = [];
  userName: string = "";
  currentFilter: "all" | "draft" | "saved" = "all";

  constructor(
    private letterService: LetterService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
      }
    });
    this.loadLetters();
  }

  loadLetters() {
    this.letterService
      .fetchLetters()
      .pipe(
        catchError(error => {
          console.error("Error loading letters", error);
          return of([]);
        })
      )
      .subscribe((letters: any) => {
        this.letters = letters.map((letter: { status: any }) => ({
          ...letter,
          status: letter.status || "draft" // Default to draft if no status
        }));
        this.filterLetters(this.currentFilter);
      });
  }

  filterLetters(filter: "all" | "draft" | "saved") {
    this.currentFilter = filter;
    this.filteredLetters =
      filter === "all"
        ? this.letters
        : this.letters.filter(letter => letter.status === filter);
  }

  editLetter(letter: Letter) {
    this.router.navigate(["/editor", letter._id]);
  }

  viewLetter(letter: Letter) {
    this.router.navigate(["/view", letter._id]);
  }

  deleteLetter(letterId: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this letter?"
    );

    if (confirmDelete) {
      this.letterService
        .deleteLetter(letterId)
        .pipe(
          catchError(error => {
            console.error("Error deleting letter", error);
            alert("Failed to delete letter. Please try again.");
            return of(null);
          })
        )
        .subscribe(() => {
          this.letters = this.letters.filter(letter => letter._id !== letterId);
          this.filterLetters(this.currentFilter);
          alert("Letter deleted successfully");
        });
    }
  }

  navigateToEditor() {
    this.router.navigate(["/editor"]);
  }
  logout(): void {
    console.log("Logout called from dashboard");
    this.authService.logout().subscribe({
      next: () => {
        console.log("Logout successful");
        this.router.navigate(["/login"]); // Navigate to the login page
      },
      error: err => {
        console.error("Logout error:", err);
      }
    });
  }
}
