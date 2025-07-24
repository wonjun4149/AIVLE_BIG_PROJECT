<template>
    <v-container>
        <v-snackbar
            v-model="snackbar.status"
            :timeout="snackbar.timeout"
            :color="snackbar.color"
        >
            
            <v-btn style="margin-left: 80px;" text @click="snackbar.status = false">
                Close
            </v-btn>
        </v-snackbar>
        <div class="panel">
            <div class="gs-bundle-of-buttons" style="max-height:10vh;">
                <v-btn @click="addNewRow" @class="contrast-primary-text" small color="primary">
                    <v-icon small style="margin-left: -5px;">mdi-plus</v-icon>등록
                </v-btn>
                <v-btn :disabled="!selectedRow" style="margin-left: 5px;" @click="openEditDialog()" class="contrast-primary-text" small color="primary">
                    <v-icon small>mdi-pencil</v-icon>수정
                </v-btn>
            </div>
            <div class="mb-5 text-lg font-bold"></div>
            <div class="table-responsive">
                <v-table>
                    <thead>
                        <tr>
                        <th>Id</th>
                        <th>약관ID</th>
                        <th>약관명</th>
                        <th>약관카테고리</th>
                        <th>약관상품명</th>
                        <th>약관 내용</th>
                        <th>약관버전</th>
                        <th>요청사항</th>
                        <th>약관리스크</th>
                        <th>Llm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(val, idx) in value" 
                            @click="changeSelectedRow(val)"
                            :key="val"  
                            :style="val === selectedRow ? 'background-color: rgb(var(--v-theme-primary), 0.2) !important;':''"
                        >
                            <td class="font-semibold">{{ idx + 1 }}</td>
                            <td class="whitespace-nowrap" label="약관ID">{{ val.termId }}</td>
                            <td class="whitespace-nowrap" label="약관명">{{ val.termTile }}</td>
                            <td class="whitespace-nowrap" label="약관카테고리">{{ val.termCategory }}</td>
                            <td class="whitespace-nowrap" label="약관상품명">{{ val.termProductName }}</td>
                            <td class="whitespace-nowrap" label="약관 내용">{{ val.termContent }}</td>
                            <td class="whitespace-nowrap" label="약관버전">{{ val.termVersion }}</td>
                            <td class="whitespace-nowrap" label="요청사항">{{ val.termRequirement }}</td>
                            <td class="whitespace-nowrap" label="약관리스크">{{ val.termRisk }}</td>
                            <td class="whitespace-nowrap" label="Llm">
                                <LlmId :editMode="editMode" v-model="val.llmId"></LlmId>
                            </td>
                            <v-row class="ma-0 pa-4 align-center">
                                <v-spacer></v-spacer>
                                <Icon style="cursor: pointer;" icon="mi:delete" @click="deleteRow(val)" />
                            </v-row>
                        </tr>
                    </tbody>
                </v-table>
            </div>
        </div>
        <v-col>
            <v-dialog
                v-model="openDialog"
                transition="dialog-bottom-transition"
                width="35%"
            >
                <v-card>
                    <v-toolbar
                        color="primary"
                        class="elevation-0 pa-4"
                        height="50px"
                    >
                        <div style="color:white; font-size:17px; font-weight:700;">Ai 등록</div>
                        <v-spacer></v-spacer>
                        <v-icon
                            color="white"
                            small
                            @click="closeDialog()"
                        >mdi-close</v-icon>
                    </v-toolbar>
                    <v-card-text>
                        <Ai :offline="offline"
                            :isNew="!value.idx"
                            :editMode="true"
                            :inList="false"
                            v-model="newValue"
                            @add="append"
                        />
                    </v-card-text>
                </v-card>
            </v-dialog>
            <v-dialog
                v-model="editDialog"
                transition="dialog-bottom-transition"
                width="35%"
            >
                <v-card>
                    <v-toolbar
                        color="primary"
                        class="elevation-0 pa-4"
                        height="50px"
                    >
                        <div style="color:white; font-size:17px; font-weight:700;">Ai 수정</div>
                        <v-spacer></v-spacer>
                        <v-icon
                            color="white"
                            small
                            @click="closeDialog()"
                        >mdi-close</v-icon>
                    </v-toolbar>
                    <v-card-text>
                        <div>
                            <Number label="약관ID" v-model="selectedRow.termId" :editMode="true"/>
                            <String label="약관명" v-model="selectedRow.termTile" :editMode="true"/>
                            <String label="약관카테고리" v-model="selectedRow.termCategory" :editMode="true"/>
                            <String label="약관상품명" v-model="selectedRow.termProductName" :editMode="true"/>
                            <String label="약관 내용" v-model="selectedRow.termContent" :editMode="true"/>
                            <Number label="약관버전" v-model="selectedRow.termVersion" :editMode="true"/>
                            <String label="요청사항" v-model="selectedRow.termRequirement" :editMode="true"/>
                            <String label="약관리스크" v-model="selectedRow.termRisk" :editMode="true"/>
                            <v-divider class="border-opacity-100 my-divider"></v-divider>
                            <v-layout row justify-end>
                                <v-btn
                                    width="64px"
                                    color="primary"
                                    @click="save"
                                >
                                    수정
                                </v-btn>
                            </v-layout>
                        </div>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-col>
    </v-container>
</template>

<script>
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import BaseGrid from '../base-ui/BaseGrid.vue'


export default {
    name: 'aiGrid',
    mixins:[BaseGrid],
    components:{
    },
    data: () => ({
        path: 'ais',
    }),
    watch: {
    },
    methods:{
    }
}

</script>