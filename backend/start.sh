#!/bin/bash

# 1. Nise scheduler-in në prapaskenë
php artisan schedule:work &

# 2. Nise serverin kryesor RoadRunner
./rr serve -c .rr.yaml