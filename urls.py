from django.conf.urls.static import static
from django.conf import settings
from django.urls import include, path
from .views import getEquationList, getJSON, noteEditInterface, processAjaxRequest, tocPage, notePage, pdfNote, collectionPage, questionBankPage, recordPage


urlpatterns = [
    path('', getEquationList, name="homepage"),
    path('getJSON', getJSON, name="getJSON"),
    path('TOC', tocPage, name="tocPage"),
    path('note', noteEditInterface, name="noteIndex"),
    path('collection/<slug:title>', collectionPage, name="noteIndex"),

    path('pdfNote/<slug:title>/<slug:chapter>', pdfNote, name="pdfNote"),

    path('note/<slug:title>/<slug:chapter>', notePage, name="notePage"),
    path('processData', processAjaxRequest, name="processData"),
    path('questionBank', questionBankPage, name="questionBank"),
    path('record', recordPage, name="recordPage"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
