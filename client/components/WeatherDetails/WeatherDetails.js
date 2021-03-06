import React from 'react';
import Draggable from 'react-draggable';
import firebaseApp from '../../base';
import classnames from 'classnames';
import weatherConditions from './weatherConditions';
import axios from 'axios';

const database = firebaseApp.database();

import styles from './WeatherDetails.css';

class WeatherDetails extends React.Component {
  constructor(props) {
    super(props);

    this.dashboard = this.props.dashboard;
    this.db_key = this.props.db_key;
    this.weatherModule = this.dashboard.modules[this.db_key];
    var context = this;

    this.state = {
      temperature: null,
      location: null,
      condition: null,
      weatherIcon: null,
      zipcode: context.weatherModule.zip || 94105,
      code: null,
      forecast: null,
    };

    this.weatherInterval = null;

    this.getWeatherData = this.getWeatherData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.clearInterval = this.clearInterval.bind(this);
  }

  getWeatherData() {
    var context = this;

    axios.get(`https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${context.state.zipcode}")&format=json`)
    .then((response) => {
      let data = response.data;
      context.setState({
        temperature: data.query.results.channel.item.condition.temp,
        location: data.query.results.channel.location.city,
        condition: data.query.results.channel.item.condition.text,
        weatherIcon: data.query.results.channel.image.url,
        code: data.query.results.channel.item.condition.code,
        forecast: data.query.results.channel.item.forecast
      });
    })
    .catch((error) => {
      console.error('Weather API error');
    })

  }

  clearInterval() {
    window.clearInterval(this.weatherInterval);
  }

  componentDidMount() {
    this.getWeatherData();
    
    this.weatherInterval = setInterval(() => {
      this.getWeatherData();
    }, 30 * 60000); // time interval of 30 minutes: 30 * 60000
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  handleSubmit(e) {
    e.preventDefault();
    const db_key = this.props.db_key;
    const user = this.props.user.uid;
    const db_ref = database.ref(`users/${user}/modules/${db_key}/zip`);

    let zipcode = this.searchInput.value;

    db_ref.set(zipcode);

    this.setState({
      zipcode: zipcode
    }, () => {
      this.clearInterval();
      this.getWeatherData();

      this.weatherInterval = setInterval(() => {
        this.getWeatherData();
      }, 30 * 60000);

      this.zipForm.reset();
    });
  }

  render() {
    let cssCard = `${styles.card} card`;
    let cssHeader = `${styles.header} card-header`;
    let cssCardContent = `${styles.content} card-content`;
    let weatherIcon = `${styles.weatherIcon} wi wi-yahoo-${this.state.code}`;
    let forecastIcon = function(code) {
      return `${styles.forecastIconStyle} wi wi-yahoo-${code}`;
    };

    let forecast = this.state.forecast;
    let x = this.props.layout.x;
    let y = this.props.layout.y;
    let h = this.props.layout.h;
    let w = this.props.layout.w;

    console.log(h, w);

    if (w >= 3 && h >= 3) {
      return (
        <div className={cssCard}>
          <header className={cssHeader}>
            <p className='card-header-title'>Weather</p>
            <div className={styles.searchIcon}><i className='fa fa-search' aria-hidden='true'></i></div>
            <form action='submit'
              className={styles.weatherForm}
              onSubmit={e => this.handleSubmit(e)}
              ref={input => this.zipForm = input}
              >
              <input className={styles.weatherInput} 
                type='text' 
                ref={input => this.searchInput = input}
                placeholder=' Enter location'
                />               
            </form>
            <div className="card-header-icon">
              <span className="icon">
                <i className='fa fa-cloud' aria-hidden='true'></i>
              </span>
            </div>
          </header>
          <div className={cssCardContent}>
            <div className={styles.cardContent}>
              <div>
                <p className={styles.location}>{this.state.location}</p>
                <p className={styles.condition}>{this.state.condition}</p>
              </div>
              <div>
                <i className={weatherIcon}></i>
                <p className={styles.temperature}> 
                  {this.state.temperature}ºF
                </p>
              </div>
            </div>
            <div className={styles.forecastDetails}>
              {forecast ? forecast.map((details, index) => 
                {
                  if (index < 5) {
                    return (
                      <div className={styles.forecastDetail}>
                        <p className={styles.forecastDay}>{details.day}</p>
                        <p className={styles.forecastDate}>{details.date.substring(3, 6)} {details.date.substring(0, 2)}</p>
                        <div className={styles.forecastIconTemp}>
                          <i className={forecastIcon(details.code)}></i>
                          <p className={styles.forecastTemp}>{Math.floor((parseInt(details.high) + parseInt(details.low))/ 2)}º</p>
                        </div>
                        <p className={styles.forecastDate}>{details.text}</p>
                      </div>
                    );
                  }
                }) : []}
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className={cssCard}>
          <header className={cssHeader}>
            <p className='card-header-title'>Weather</p>
            <div className={styles.searchIcon}><i className='fa fa-search' aria-hidden='true'></i></div>
            <form action='submit'
              className={styles.weatherForm}
              onSubmit={e => this.handleSubmit(e)}
              ref={input => this.zipForm = input}
              >
              <input className={styles.weatherInput} 
                type='text' 
                ref={input => this.searchInput = input}
                placeholder=' Enter location'
                />               
            </form>
            <div className="card-header-icon">
              <span className="icon">
                <i className='fa fa-cloud' aria-hidden='true'></i>
              </span>
            </div>
          </header>
          <div className={cssCardContent}>
            <div className={styles.cardContent}>
              <div>
                <p className={styles.location}>{this.state.location}</p>
                <p className={styles.condition}>{this.state.condition}</p>
              </div>
              <div>
                <i className={weatherIcon}></i>
                <p className={styles.temperature}> 
                  {this.state.temperature}ºF
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default WeatherDetails;
