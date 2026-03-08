#!/bin/bash

# Nise scheduler-in në prapaskenë (background)
php artisan schedule:work &

# Nise serverin kryesor RoadRunner (foreground)
./rr serve -c .rr.yaml