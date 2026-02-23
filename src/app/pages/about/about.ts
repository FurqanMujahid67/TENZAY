import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  // All theme initialization is handled by the Header component
}
