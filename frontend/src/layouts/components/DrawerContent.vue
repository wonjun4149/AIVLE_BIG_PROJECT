<script setup>
import {
  VerticalNavLink,
  VerticalNavSectionTitle,
} from '@layouts'
</script>

<template>
    <ul>
        <VerticalNavSectionTitle :item="{ heading: 'AI' }" />
        <VerticalNavLink
            :item="{
                title: 'AI',
                to: '/ais',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '약관 관리' }" />
        <VerticalNavLink
            :item="{
                title: '약관',
                to: '/terms',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '약관 조회',
                to: '/getTerms',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '사용자 관리' }" />
        <VerticalNavLink
            :item="{
                title: '사용자',
                to: '/users',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '내 정보 조회',
                to: '/getUserInfos',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '포인트 관리' }" />
        <VerticalNavLink
            :item="{
                title: '포인트',
                to: '/points',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '포인트 조회',
                to: '/getPoints',
            }"
        />
    </ul>
</template>
