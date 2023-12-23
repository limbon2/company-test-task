import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";

@Component({
  selector: "ta-pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: ["./pagination.component.scss"],
  standalone: true,
  imports: [CommonModule],
})
export class PaginationComponent implements OnChanges {
  @Input() public pageCount: number = 1;
  @Input() public isVisible: boolean = true;
  @Input() public activePage: number = 1;

  public pages: number[] = [];

  @Output() public pageChange = new EventEmitter<number>();

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["pageCount"]) {
      this.pages = Array.from({ length: changes["pageCount"].currentValue }).map((_, i) => i + 1);
    }
  }
}
