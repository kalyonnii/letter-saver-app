import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LetterService } from 'src/app/services/letter.service';

interface Letter {
  _id: string;
  title: string;
  content: string;
  status: 'draft' | 'saved';
  savedAt: Date;
  driveFileId?: string;
}
@Component({
  selector: 'app-viewletter',
  templateUrl: './viewletter.component.html',
  styleUrls: ['./viewletter.component.scss']
})
export class ViewletterComponent {
  letter: Letter | null = null;

  constructor(
    private route: ActivatedRoute,
    private letterService: LetterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const letterId = this.route.snapshot.paramMap.get('id');
    if (letterId) {
      this.loadLetter(letterId);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loadLetter(letterId: string): void {
    this.letterService.getLetterById(letterId).subscribe({
      next: (letter:any) => {
        this.letter = letter;
      },
      error: (error:any) => {
        console.error('Error loading letter', error);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  editLetter(): void {
    if (this.letter) {
      this.router.navigate(['/editor', this.letter._id]);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
