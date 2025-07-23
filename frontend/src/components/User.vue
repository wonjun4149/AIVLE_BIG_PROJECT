<template>
    <div>
        <String
            label="이름"
            v-model="value.name"
            :editMode="editMode"
        />
        <String
            label="비밀번호"
            v-model="value.password"
            :editMode="editMode"
        />
        <String
            label="직장"
            v-model="value.company"
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
    name: 'User',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "users",
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
