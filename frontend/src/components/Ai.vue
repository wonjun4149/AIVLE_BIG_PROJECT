<template>
    <div>
        <Number
            label="약관ID"
            v-model="value.termId"
            :editMode="editMode"
        />
        <String
            label="약관명"
            v-model="value.termTile"
            :editMode="editMode"
        />
        <String
            label="약관카테고리"
            v-model="value.termCategory"
            :editMode="editMode"
        />
        <String
            label="약관상품명"
            v-model="value.termProductName"
            :editMode="editMode"
        />
        <String
            label="약관 내용"
            v-model="value.termContent"
            :editMode="editMode"
        />
        <Number
            label="약관버전"
            v-model="value.termVersion"
            :editMode="editMode"
        />
        <String
            label="요청사항"
            v-model="value.termRequirement"
            :editMode="editMode"
        />
        <String
            label="약관리스크"
            v-model="value.termRisk"
            :editMode="editMode"
        />
        <v-row class="ma-0 pa-0">
            <v-spacer></v-spacer>
            <v-btn width="64px" color="primary" @click="save">
                저장
            </v-btn>
        </v-row>
    </div>
</template>


<script>
import BaseEntity from './base-ui/BaseEntity.vue'

export default {
    name: 'Ai',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "ais",
        value: {
        }
    }),
    created(){
    },
    computed:{
    },
    methods: {
    },
}
</script>
