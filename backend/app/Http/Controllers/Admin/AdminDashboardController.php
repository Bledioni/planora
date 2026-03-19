<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Business;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Appointments;
use App\Models\Employees;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{

    public function getDashboardStats()
    {
        try {
            // 1. Total Businesses
            $totalBusinesses = Business::count();
            
            // 2. Growth Rate (this week vs last week)
            $thisWeekStart = now()->startOfWeek();
            $lastWeekStart = now()->subWeek()->startOfWeek();
            $lastWeekEnd = now()->subWeek()->endOfWeek();
            
            $businessesThisWeek = Business::where('created_at', '>=', $thisWeekStart)->count();
            $businessesLastWeek = Business::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->count();
            
            $growthRate = $businessesLastWeek > 0 
                ? round((($businessesThisWeek - $businessesLastWeek) / $businessesLastWeek) * 100, 1)
                : ($businessesThisWeek > 0 ? 100 : 0);
            
            // 3. Total Appointments Today
            $appointmentsToday = Appointments::whereDate('created_at', today())->count();
            
            // 4. Popular Categories
            $popularCategories = Business::select('category_id', DB::raw('count(*) as total'))
                ->with('categories:id,name')
                ->groupBy('category_id')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'name' => $item->category->name ?? 'N/A',
                        'total' => $item->total
                    ];
                });
            
            // 5. Active vs Pending Businesses
            $activeBusinesses = User::where('role', 'business_owner')
                ->where('status', 'active')
                ->count();
            $pendingBusinesses = User::where('role', 'business_owner')
                ->where('status', 'pending')
                ->count();
            
            // 6. Expiring Subscriptions (next 7 days)
            $expiringSoon = Subscription::where('status', 'active')
                ->whereBetween('end_date', [now(), now()->addDays(7)])
                ->count();

            // 7. Total Employees
            $totalEmployees = Employees::count();

            return response()->json([
                'status' => 'success',
                'stats' => [
                    'total_businesses'     => $totalBusinesses,
                    'growth_rate'          => $growthRate,
                    'businesses_this_week' => $businessesThisWeek,
                    'businesses_last_week' => $businessesLastWeek,
                    'appointments_today'   => $appointmentsToday,
                    'popular_categories'   => $popularCategories,
                    'active_businesses'    => $activeBusinesses,
                    'pending_businesses'   => $pendingBusinesses,
                    'expiring_soon'        => $expiringSoon,
                    'total_employees'      => $totalEmployees, // 👈 added
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching dashboard stats: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gabim gjatë marrjes së statistikave',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}