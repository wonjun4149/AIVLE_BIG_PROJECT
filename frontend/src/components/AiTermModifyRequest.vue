<template>

    <v-card outlined>
        <v-card-title>
            AiTermModifyRequest
        </v-card-title>

        <v-card-text>
            <Number label="Id" v-model="value.id" :editMode="editMode"/>
            <Number label="UserId" v-model="value.userId" :editMode="editMode"/>
            <String label="Title" v-model="value.title" :editMode="editMode"/>
            <String label="Category" v-model="value.category" :editMode="editMode"/>
            <String label="ProductName" v-model="value.productName" :editMode="editMode"/>
            <String label="Content" v-model="value.content" :editMode="editMode"/>
            <String label="Requirement" v-model="value.requirement" :editMode="editMode"/>
            <String label="Version" v-model="value.version" :editMode="editMode"/>
            <String label="Memo" v-model="value.memo" :editMode="editMode"/>
            <String label="Origin" v-model="value.origin" :editMode="editMode"/>
            <Date label="CreatedAt" v-model="value.createdAt" :editMode="editMode"/>
            <Date label="ModifiedAt" v-model="value.modifiedAt" :editMode="editMode"/>
            <Date label="ExpiresAt" v-model="value.expiresAt" :editMode="editMode"/>
            <String label="Risk" v-model="value.risk" :editMode="editMode"/>
            <String label="Feedback" v-model="value.feedback" :editMode="editMode"/>
            <String label="Client" v-model="value.client" :editMode="editMode"/>
            <String label="UserCompany" v-model="value.userCompany" :editMode="editMode"/>
            <String label="LangCode" v-model="value.langCode" :editMode="editMode"/>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                    color="deep-purple lighten-2"
                    text
                    @click="aiTermModifyRequest"
            >
                AiTermModifyRequest
            </v-btn>
            
            <v-btn
                    color="deep-purple lighten-2"
                    text
                    @click="close"
            >
                Close
            </v-btn>
        </v-card-actions>
    </v-card>

</template>

<script>

export default {
    name: 'AiTermModifyRequestCommand',
    components:{
    },
    props: {},
    data: () => ({
        editMode: true,
        value: {},
    }),
    created() {
        this.value.id = 0;
        this.value.userId = 0;
        this.value.title = '';
        this.value.category = '';
        this.value.productName = '';
        this.value.content = '';
        this.value.requirement = '';
        this.value.version = '';
        this.value.memo = '';
        this.value.origin = '';
        this.value.createdAt = '2025-07-24';
        this.value.modifiedAt = '2025-07-24';
        this.value.expiresAt = '2025-07-24';
        this.value.risk = '';
        this.value.feedback = '';
        this.value.client = '';
        this.value.userCompany = '';
        this.value.langCode = '';
    },
    watch: {
    },
    methods: {
        aiTermModifyRequest() {
            this.$emit('aiTermModifyRequest', this.value);
        },
        close() {
            this.$emit('closeDialog');
        },
        change() {
            this.$emit("update:modelValue", this.value);
        },
    }
}
</script>

