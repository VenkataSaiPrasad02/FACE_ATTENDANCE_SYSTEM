package com.example.faceattendance.util;

/**
 * Geographic helpers. The backend is the single source of truth for
 * attendance distance validation — frontend calculations are never trusted.
 */
public final class GeoUtil {

    /*
     * Mean Earth radius in metres.
     */
    private static final double EARTH_RADIUS_METERS = 6_371_000.0;

    private GeoUtil() {
    }

    /**
     * Great-circle distance between two WGS-84 coordinates using the
     * Haversine formula.
     *
     * @return distance in metres (never negative)
     */
    public static double distanceMeters(
            double lat1, double lon1,
            double lat2, double lon2) {

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double radLat1 = Math.toRadians(lat1);
        double radLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(radLat1) * Math.cos(radLat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }
}
