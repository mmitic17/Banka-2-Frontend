import {Component} from '@angular/core';
import {Future} from "../../../models/stock-exchange.model";
import {StockService} from "../../../services/stock.service";
import {ActivatedRoute} from "@angular/router";
import { error } from 'cypress/types/jquery';
import { UserService } from 'src/app/services/user-service.service';
import { User } from 'src/app/models/users.model';
import { MenuItem } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { interval } from 'rxjs';

@Component({
  selector: 'app-single-future-table',
  templateUrl: './single-future-table.component.html',
  styleUrls: ['./single-future-table.component.css']
})
export class SingleFutureTableComponent {

  loading: boolean = true; // on load setovati na false

  allFutures: Future[] // prosledjuje mi parent
  futures: Future[] // za prikaz
  myFutures: Future[] // moji
  buyableFutures: Future[]// za kupovinu

  futureName: string = "";
  userId: number;
  changeOption: boolean = false;

  breadcrumbItems: MenuItem[]

  constructor(private stockService: StockService, private userService: UserService 
    ,private route: ActivatedRoute, private toastr: ToastrService) {

  }



  ngOnInit() {

    //interval
    const source = interval(10000); // 10000 ms = 10 seconds
    source.subscribe(() => {
      // sve sta se poziva na 10 sekunde
      this.getUser()
    });

 
    this.route.paramMap.subscribe(params => {
      this.futureName = params.get('name')!;
      // console.log(this.futureName);
    });

    this.breadcrumbItems = [
      {label: 'Početna', routerLink: ['/home']},
      {label: 'Terminski ugovori', routerLink: ['/futures']},
      {label: `${this.futureName}`, routerLink: [`/future/${this.futureName}`]}
    ];

    this.getUser()
    this.getAllWaitingFuturesForUser()
  }

  getUser(){
    this.userService.getUserData().subscribe({
      next: val=>{
        this.userId = val.id;
        // console.log(val)
        this.getAllFutures()
      },
      error: err=>{
        // greska da se ne prikaze nista
        this.futures = []
        this.myFutures = []
        this.buyableFutures =[]
        console.log(err);
      }
    })
  }

  getAllFutures() {
      this.stockService.getAllFuturesByName(this.futureName).subscribe({
        next: val=>{

          // dohvatam sve ali treba da se filtrira
          this.allFutures = val;

          this.futures = []
          this.myFutures = []
          this.buyableFutures =[]
          // todo mozda promeniti da je userId ne user_id
          for(const f of this.allFutures){
            if(f.user !== null){
              if(f.user.id !== this.userId){
                if(f.forSale){
                  this.buyableFutures.push(f)
                  this.futures.push(f)
                }
              }
              else{
                this.myFutures.push(f)
              }
            }
            else{
              this.buyableFutures.push(f)
              this.futures.push(f)
            }
          }
          if(this.changeOption){
            this.futures = this.myFutures
            
          }
          else{
            this.futures = this.buyableFutures
          }

          this.loading = false;
        },
        error: err =>{
          console.log(err);
          this.allFutures = []
          this.loading = false;
        }
      })
  }

  changeFuturesForShow(){
    if(this.changeOption){
      this.futures = this.myFutures
      
    }
    else{
      this.futures = this.buyableFutures
    }
    // this.changeOption = !this.changeOption
  }

  // OVO JA IMAM
  buyFuture(futureToBuy: Future) {
      console.log(futureToBuy)
      this.stockService.buyFuture(
        futureToBuy.id,
        futureToBuy.futureName,
        "BUY",
        futureToBuy.maintenanceMargin,
        0,
        0
      ).subscribe({
        next: val=>{
          console.log(val)
          this.getAllFutures()
          this.toastr.info("Uspesno je kupljen")
          
        },
        error: err=>{
          console.log(err)
          this.toastr.error("Greska pri kupovini")
        }
      })
  }

  sellFuture(futureToSell: Future) {
      this.stockService.sellFuture(
        futureToSell.id,
        futureToSell.futureName,
        "SELL",
        futureToSell.maintenanceMargin,// todo ovde setuje korisnik cenu
        0,
        0
      ).subscribe({
        next: val=>{
          // alert(val) 
          // this.changeOption= false;
          this.getAllFutures()
         
          this.toastr.info("Uspesno je stavljen za prodaju")
          
        },
        error: err=>{
          console.log(err);
          
          this.toastr.error("Greska pri prodaji")
        }
      })
  }

  sellWithLimit(futureToSell: Future) {
    this.stockService.sellFuture(
      futureToSell.id,
      futureToSell.futureName,
      "SELL",
      futureToSell.maintenanceMargin,// todo ovde setuje korisnik cenu
      2000,
      1000
    ).subscribe({
      next: val=>{
        // alert(val) 
        // this.changeOption= false;
        this.getAllFutures()
        this.getAllWaitingFuturesForUser();
        // close window
        // emitujes parentu 
       
        this.toastr.info("Uspesno je stavljen za prodaju")
        
      },
      error: err=>{
        // alert(err)
        this.toastr.error("Greska pri prodaji")
      }
    })
}

// OVO JA IMAM
  removeFromMarket(futereId: string){
    this.stockService.removeFutureFromMarket(
      futereId
    ).subscribe({
      next: val=>{
        // console.log(val);
        this.getAllFutures()
        this.toastr.info("Uspesno je skinut sa prodaje")
      },
      error: err=>{
          console.log(err)
          this.toastr.error("Greska pri skidanju sa prodaje")
      }
    })
  }

  buyWithLimit(){

  }
  // OVO JA IMAM
  getAllWaitingFuturesForUser(){
    
    this.stockService.getAllWaitingFuturesForUser(
      "sell",
      this.futureName
    ).subscribe({
      next: val=>{
        console.log(val);
      },
      error: err=>{
        console.log(err);
      }
    })
  }


}
