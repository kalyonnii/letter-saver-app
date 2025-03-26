// editor.component.ts
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LetterService } from "../../services/letter.service";
import { AuthService } from "../../services/auth.service";
// import  DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.scss"]
})
export class EditorComponent implements OnInit {
  // public Editor = DecoupledEditor;
  public EditorConfig = {
    toolbar: {
      items: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        // 'fontColor',
        // 'fontBackgroundColor',
        "|",
        "fontSize",
        "heading",
        "|",
        "alignment",
        "|",
        "numberedList",
        "bulletedList",
        "|",
        // 'indent',
        // 'outdent',
        // '|',
        "link",
        "|",
        "undo",
        "redo"
      ]
    },
    language: "en"
  };
  letterTitle: string = "";
  letterContent: string = "";
  lastSavedLetterId: string | null = null;
  loading: any;

  constructor(
    private letterService: LetterService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const letterId = params.get("id");
      if (letterId) {
        this.loadLetterFromDrive(letterId);
      }
    });
  }

  public onReady(editor: any) {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
      );
    editor.getData();
  }
  // Fetch Letter from Google Drive
  loadLetterFromDrive(letterId: string) {
    this.letterService.getLetterById(letterId).subscribe(
      (response: any) => {
        this.letterTitle = response.title;
        this.letterContent = response.content;
        this.lastSavedLetterId = response._id; // Ensure this is the correct letter ID
      },
      (error: any) => {
        console.error("Error loading letter from Drive", error);
        alert("Failed to load letter from Google Drive");
      }
    );
  }

  // Save letter as a draft or update if it already exists
  saveLetter() {
    if (this.letterTitle && this.letterContent) {
      const letterData = {
        title: this.letterTitle,
        content: this.letterContent
      };

      if (this.lastSavedLetterId) {
        // Update existing letter
        this.letterService
          .updateLetter(this.lastSavedLetterId, letterData)
          .subscribe(
            () => alert("Letter updated successfully"),
            (error: any) => {
              console.error("Error updating letter", error);
              alert("Failed to update letter");
            }
          );
      } else {
        // Create new letter
        this.letterService.createLetter(letterData).subscribe(
          (response: any) => {
            this.lastSavedLetterId = response._id;
            alert("Letter saved as draft");
          },
          (error: any) => {
            console.error("Error saving letter", error);
            alert("Failed to save letter");
          }
        );
      }
    }
  }

  // Save letter to Google Drive
  // Save letter to Google Drive
  saveLetterToDrive() {
    this.loading = true; // Start loading

    if (this.lastSavedLetterId) {
      this.letterService.saveLetterToDrive(this.lastSavedLetterId).subscribe(
        () => {
          this.loading = false; // Stop loading on success
          alert("Letter saved to Google Drive");
          this.router.navigate(["/dashboard"]);
        },
        (error: any) => {
          this.loading = false; // Stop loading on error
          console.error("Error saving to Drive", error);
          alert("Failed to save to Google Drive");
        }
      );
    } else {
      this.loading = false; // Ensure loading stops if no ID is found
      alert("No letter ID found to save.");
    }
  }
}
