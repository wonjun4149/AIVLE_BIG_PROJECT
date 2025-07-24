<template>
    <div>
        <Number
            label="사용자명"
            v-model="value.userId"
            :editMode="editMode"
        />
        <String
            label="약관명"
            v-model="value.title"
            :editMode="editMode"
        />
        <String
            label="Category"
            v-model="value.category"
            :editMode="editMode"
        />
        <String
            label="상품명"
            v-model="value.productName"
            :editMode="editMode"
        />
        <String
            label="약관내용"
            v-model="value.content"
            :editMode="editMode"
        />
        <String
            label="요청사항"
            v-model="value.requirement"
            :editMode="editMode"
        />
        <String
            label="버전"
            v-model="value.version"
            :editMode="editMode"
        />
        <String
            label="수정내용메모"
            v-model="value.memo"
            :editMode="editMode"
        />
        <String
            label="Origin"
            v-model="value.origin"
            :editMode="editMode"
        />
        <Date
            label="최초생성일"
            v-model="value.createdAt"
            :editMode="editMode"
        />
        <Date
            label="최근수정일"
            v-model="value.modifiedAt"
            :editMode="editMode"
        />
        <Date
            label="만료일 "
            v-model="value.expiresAt"
            :editMode="editMode"
        />
        <String
            label="리스크"
            v-model="value.risk"
            :editMode="editMode"
        />
        <String
            label="피드백"
            v-model="value.feedback"
            :editMode="editMode"
        />
        <String
            label="거래처"
            v-model="value.client"
            :editMode="editMode"
        />
        <String
            label="직장명"
            v-model="value.userCompany"
            :editMode="editMode"
        />
        <String
            label="언어코드"
            v-model="value.langCode"
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
    name: 'Term',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "terms",
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
