CREATE TABLE car (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(255),
    model VARCHAR(255),
    state_number VARCHAR(100),
    vin VARCHAR(100)
);

CREATE TABLE rent (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    car_id INTEGER,
    day INTEGER,
    price INTEGER,
    FOREIGN KEY (car_id) REFERENCES car (id)
);


