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
            <GetTerm @search="search" style="margin-bottom: 10px; background-color: #ffffff;"></GetTerm>
            <div class="mb-5 text-lg font-bold"></div>
            <div class="table-responsive">
                <v-table>
                    <thead>
                        <tr>
                        <th>Id</th>
                        <th>사용자명</th>
                        <th>약관명</th>
                        <th>Category</th>
                        <th>상품명</th>
                        <th>약관내용</th>
                        <th>요청사항</th>
                        <th>버전</th>
                        <th>수정내용메모</th>
                        <th>Origin</th>
                        <th>최초생성일</th>
                        <th>최근수정일</th>
                        <th>만료일 </th>
                        <th>리스크</th>
                        <th>피드백</th>
                        <th>거래처</th>
                        <th>직장명</th>
                        <th>언어코드</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(val, idx) in value" 
                            @click="changeSelectedRow(val)"
                            :key="val"  
                            :style="val === selectedRow ? 'background-color: rgb(var(--v-theme-primary), 0.2) !important;':''"
                        >
                            <td class="font-semibold">{{ idx + 1 }}</td>
                            <td class="whitespace-nowrap" label="사용자명">{{ val.userId }}</td>
                            <td class="whitespace-nowrap" label="약관명">{{ val.title }}</td>
                            <td class="whitespace-nowrap" label="Category">{{ val.category }}</td>
                            <td class="whitespace-nowrap" label="상품명">{{ val.productName }}</td>
                            <td class="whitespace-nowrap" label="약관내용">{{ val.content }}</td>
                            <td class="whitespace-nowrap" label="요청사항">{{ val.requirement }}</td>
                            <td class="whitespace-nowrap" label="버전">{{ val.version }}</td>
                            <td class="whitespace-nowrap" label="수정내용메모">{{ val.memo }}</td>
                            <td class="whitespace-nowrap" label="Origin">{{ val.origin }}</td>
                            <td class="whitespace-nowrap" label="최초생성일">{{ val.createdAt }}</td>
                            <td class="whitespace-nowrap" label="최근수정일">{{ val.modifiedAt }}</td>
                            <td class="whitespace-nowrap" label="만료일 ">{{ val.expiresAt }}</td>
                            <td class="whitespace-nowrap" label="리스크">{{ val.risk }}</td>
                            <td class="whitespace-nowrap" label="피드백">{{ val.feedback }}</td>
                            <td class="whitespace-nowrap" label="거래처">{{ val.client }}</td>
                            <td class="whitespace-nowrap" label="직장명">{{ val.userCompany }}</td>
                            <td class="whitespace-nowrap" label="언어코드">{{ val.langCode }}</td>
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
                        <div style="color:white; font-size:17px; font-weight:700;">Term 등록</div>
                        <v-spacer></v-spacer>
                        <v-icon
                            color="white"
                            small
                            @click="closeDialog()"
                        >mdi-close</v-icon>
                    </v-toolbar>
                    <v-card-text>
                        <Term :offline="offline"
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
                        <div style="color:white; font-size:17px; font-weight:700;">Term 수정</div>
                        <v-spacer></v-spacer>
                        <v-icon
                            color="white"
                            small
                            @click="closeDialog()"
                        >mdi-close</v-icon>
                    </v-toolbar>
                    <v-card-text>
                        <div>
                            <Number label="사용자명" v-model="selectedRow.userId" :editMode="true"/>
                            <String label="약관명" v-model="selectedRow.title" :editMode="true"/>
                            <String label="Category" v-model="selectedRow.category" :editMode="true"/>
                            <String label="상품명" v-model="selectedRow.productName" :editMode="true"/>
                            <String label="약관내용" v-model="selectedRow.content" :editMode="true"/>
                            <String label="요청사항" v-model="selectedRow.requirement" :editMode="true"/>
                            <String label="버전" v-model="selectedRow.version" :editMode="true"/>
                            <String label="수정내용메모" v-model="selectedRow.memo" :editMode="true"/>
                            <String label="Origin" v-model="selectedRow.origin" :editMode="true"/>
                            <Date label="최초생성일" v-model="selectedRow.createdAt" :editMode="true"/>
                            <Date label="최근수정일" v-model="selectedRow.modifiedAt" :editMode="true"/>
                            <Date label="만료일 " v-model="selectedRow.expiresAt" :editMode="true"/>
                            <String label="리스크" v-model="selectedRow.risk" :editMode="true"/>
                            <String label="피드백" v-model="selectedRow.feedback" :editMode="true"/>
                            <String label="거래처" v-model="selectedRow.client" :editMode="true"/>
                            <String label="직장명" v-model="selectedRow.userCompany" :editMode="true"/>
                            <String label="언어코드" v-model="selectedRow.langCode" :editMode="true"/>
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
    name: 'termGrid',
    mixins:[BaseGrid],
    components:{
    },
    data: () => ({
        path: 'terms',
    }),
    watch: {
    },
    methods:{
    }
}

</script>