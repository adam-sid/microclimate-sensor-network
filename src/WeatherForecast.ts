// interfaces for WeatherForecast type and WeatherCondition type
export interface WeatherForecast {
    [key: string]: any;
    dt: number;
    temp: number;
    feels_like?: number;
    pressure: number;
    humidity: number;
    dew_point?: number;
    uvi: number;
    clouds: number;
    visibility?: number;
    wind_speed: number;
    wind_deg?: number;
    wind_gust?: number;
    weather: WeatherCondition[];
    pop?: number;
    day_sin?: number;
    day_cos?: number;
    year_sin?: number;
    year_cos?: number;
}

export interface WeatherCondition {
    id: number;
    main: string;
    description: string;
    icon: string;
}
