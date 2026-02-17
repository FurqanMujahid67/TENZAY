import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/header/header';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, Header, Footer],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {
  ngOnInit() {
    this.loadThemeScripts();
  }

  loadThemeScripts() {
    const elements = document.querySelectorAll('.set-bg');
    elements.forEach((element: any) => {
      const bg = element.getAttribute('data-setbg');
      if (bg) {
        element.style.backgroundImage = `url(${bg})`;
      }
    });
  }
}
