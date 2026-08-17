package com.example.faceattendance.config;

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.TimeUnit;

/**
 * Configures the RestTemplate used by FaceRecognitionClient.
 * Uses Apache HttpComponents 5 for timeout configuration (Spring Boot 3 compatible).
 */
@Configuration
public class RestClientConfig {

    @Value("${face.service.connect-timeout:5000}")
    private int connectTimeoutMs;

    @Value("${face.service.read-timeout:30000}")
    private int readTimeoutMs;

    @Bean
    public RestTemplate restTemplate() {
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(connectTimeoutMs, TimeUnit.MILLISECONDS)
                .setResponseTimeout(readTimeoutMs, TimeUnit.MILLISECONDS)
                .build();

        HttpClient httpClient = HttpClientBuilder.create()
                .setDefaultRequestConfig(requestConfig)
                .build();

        HttpComponentsClientHttpRequestFactory factory =
                new HttpComponentsClientHttpRequestFactory(httpClient);

        return new RestTemplate(factory);
    }
}
