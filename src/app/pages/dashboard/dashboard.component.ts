import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { NewGameResponse } from "../../model/new-game-response";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'dashboard-cmp',
  templateUrl: 'dashboard.component.html'
})

export class DashboardComponent implements OnInit {

  gameWord = ""

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.boostrapValidaitonsSetup();
  }

  startGame(): void {
    if(this.gameWord.trim() === "") {
      this.toastr.warning(
        '<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">Digite uma <b>palavra</b> para iniciar um jogo<b>.</span>',
        "",
        {
          timeOut: 4000,
          closeButton: true,
          enableHtml: true,
          toastClass: "alert alert-warning alert-with-icon"
        }
      );
      return;
    }

    this.http.post<NewGameResponse>(`${environment.BACKEND_URL}/api/v0/games`, { guessWord: this.gameWord }).subscribe(
      (response) => {
        this.router.navigate(["/games", response.gameID]);
      }
    );
  }



  boostrapValidaitonsSetup() {
    const forms: any = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach((form: any) => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
  }

}
