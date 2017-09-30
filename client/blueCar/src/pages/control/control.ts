import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

/**
 * Generated class for the ControlPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-control',
  templateUrl: 'control.html',
})
export class ControlPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, private bluetoothSerial: BluetoothSerial) {
    let connect = this.bluetoothSerial.connect('b8:27:eb:29:4a:fb');

    let subscription = connect.subscribe(
      data => {
        console.log(data);
      }
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ControlPage');
  }

}
