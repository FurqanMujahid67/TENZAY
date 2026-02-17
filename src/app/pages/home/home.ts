import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  ngOnInit() {
    // Initialize theme scripts if needed
    this.loadThemeScripts();
  }

  loadThemeScripts() {
    // Set background images for elements with data-setbg attribute
    const elements = document.querySelectorAll('.set-bg');
    elements.forEach((element: any) => {
      const bg = element.getAttribute('data-setbg');
      if (bg) {
        element.style.backgroundImage = `url(${bg})`;
      }
    });
  }
}
