from django import forms

class StatusForm(forms.Form):
    userid = forms.CharField(max_length=64)
    text = forms.CharField(widget=forms.Textarea)
    posted = forms.BooleanField(required=False);
