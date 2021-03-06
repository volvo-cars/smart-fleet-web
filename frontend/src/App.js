import React, { Component } from 'react';
import Strapi from 'strapi-sdk-javascript/build/main';
import CarPicker from './VehiclePicker';

import {getVehicles, getBookings, submitReservationForReview} from './api';
import DatePicker from "./DatePicker";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Header from "./Common/Header";
//============================================================================//

const strapi = new Strapi("http://localhost:1337");
const uuidv1 = require('uuid/v1');

class App extends Component {
  constructor() {
    super();
    this.state = {
      accountInfo: [],
      submittedLogin: false,
      loadingReservationData: true,
      vehicleData: [],
      reservationData: [],
      bookingData: [],
      reservationRequest: [],
      globalError: false,
      availableVehicles: []
    }
  }

  componentDidMount() {
    getVehicles()
      .then(vehicles => {vehicles.json()
        .then(vehicleData => {
          this.setState({ vehicleData: vehicleData });
          return strapi.getEntries("reservations");
        })
        .then(reservationData => {
          this.setState({ reservationData: reservationData, loadingReservationData: false });
        })
      })
      .catch(err => {
        console.error(err);
        this.setState({globalError: true, loadingReservationData: false });
      })
    getBookings()
      .then(bookings => {bookings.json()
        .then(bookingData => {
          this.setState({ bookingData: bookingData })
        })
      })
      .catch(err => {
        console.error(err);
        this.setState({globalError: true });
      })
  }

  receiveAccountInfo = (accounts) => {
    this.setState({ accountInfo: accounts}, () => {
      this.setState({ submittedLogin: true })
    })
  };

  onSelectCalendarDates = (requested) => {
    let availableVehs;
    // const { reservationData } = this.state;
    /*
    for (let i = 0; i < reservationData.length; i++) {
      const iStartDate = convertStrToDate(reservationData[i].start_time);
      const iEndDate = convertStrToDate(reservationData[i].endTime);

      // descr: requested START is ok if
      //    1) After iStartDate OR
      //    2) Same day as iStartDate, but in afternoon
      console.log(requested.start.date > iStartDate)
      console.log(requested.start.date === iStartDate)
      if (requested.start.date > iStartDate ||
        (requested.start.date === iStartDate && requested.start.timeOfDay === "afternoon")
      ) {
        debugger;
      } else {
        // invalid
        debugger;
      }

      // descr: requested END is ok if
      //    1) Before iStartDate OR
      //    2) Same day as iStartDate, but in morning
      if (requested.end.date < iStartDate ||
        (requested.end.date === iStartDate && requested.end.timeOfDay === "morning")
      ) {
        debugger;
      } else {
        // invalid
        debugger;
      }
      console.log(iStartDate, iEndDate);
      debugger;
      // availableVehs.push(reservationData[i])
    }
    */
    availableVehs = this.state.vehicleData;
    this.setState({ availableVehicles: availableVehs, reservationRequest: requested })
  };

  submitReservation = (vehicle) => {
    const newObj = {
      id: uuidv1(),
      admin: this.state.accountInfo[0].Admin,
      startTime: this.state.reservationRequest.start.date.toISOString(),
      endTime: this.state.reservationRequest.end.date.toISOString(),
      health: "green",
      status: "pending",
      email: this.state.accountInfo[0].userEmail,
      vin: vehicle.Vin
    };
    strapi.createEntry("reservations", newObj);
    submitReservationForReview(newObj);
  };


  showCarPicker = () => {
    if (this.state.availableVehicles.length > 0) {
      return <CarPicker
        availableVehicles={this.state.availableVehicles}
        submitReservation={this.submitReservation}
      />
    } else {
      return null;
      // return <div>No vehicles found for dates you provided :(</div>
    }
  };

  render() {
    console.log('reservationData: ', this.state.reservationData);
    console.log('vehicleData: ', this.state.vehicleData);
    console.log('bookingData: ', this.state.bookingData);

    // return (
    //   <>
    //     <Header/>
    //     <main className='content-container'>
    //       <AdminPanel
    //         vehicleData={this.state.vehicleData}
    //         reservationData={this.state.reservationData}
    //       />
    //     </main>
    //   </>
    // )

    if (!this.state.submittedLogin) {
      return (
        <>
          <Header/>
            <main className='content-container'>
              <Login receiveAccountInfo={this.receiveAccountInfo}/>
            </main>
        </>
      )
    } else if (this.state.accountInfo[0].userEmail === this.state.accountInfo[0].Admin) {
      // descr: authenticated as admin
      return (
        <>
          <Header/>
          <main className='content-container'>
            <AdminPanel
              vehicleData={this.state.vehicleData}
              reservationData={this.state.reservationData}
              bookingData={this.state.bookingData}
            />
          </main>
        </>
      )
    } else if (this.state.loadingReservationData) {
      return (
        <>
          <Header/>
          <div>Loading reservation data...</div>
        </>
      )
    } else if (this.state.globalError) {
      return (
        <>
          <Header/>
          <main>:( Error occurred while fetching information. Please try again later</main>
        </>
      )
    } else {
      return (
        <>
          <Header/>
          <main className='content-container'>
            <DatePicker onSelectCalendarDates={this.onSelectCalendarDates}/>
            {this.showCarPicker()}
          </main>
        </>
      );
    }
  }
}

export default App;