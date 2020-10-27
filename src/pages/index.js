import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import {makeStyles} from '@material-ui/core/styles'
import {navigate} from "gatsby";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import Recaptcha from 'react-google-recaptcha'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import * as yup from "yup";

const useStyles = makeStyles(theme => ({
  recaptcha: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }
}))

const SITE_RECAPTCHA_KEY = process.env.GATSBY_SITE_RECAPTCHA_KEY
if (typeof SITE_RECAPTCHA_KEY === 'undefined') {
  throw new Error('reCAPTCHAキーが設定されていません')
}

const schema = yup.object().shape({
  email: yup.string().max(320).required().label("メールアドレス"),
  message: yup.string().max(500).required().label("メッセージ")
});

const encode = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

const Home = () => {
  const classes = useStyles();
  const {register, handleSubmit, errors} = useForm({
    resolver: yupResolver(schema)
  });
  const [recaptcha, setRecaptcha] = React.useState('')

  const onSubmit = (data) => {
    if (recaptcha === '') {
      console.log('チェックを入れてください')
      return
    }

    fetch("/", {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: encode({
        'form-name': 'contact-recaptcha',
        'g-recaptcha-response': recaptcha,
        ...data,
      }),
    })
      .then(() => navigate("/thanks/"))
      .catch(() => console.log("お問い合わせに失敗しました"));
  };

  return (
    <Container>
      <Grid container>
        <Grid item xs={6}>
          <form data-netlify="true" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              name={"email"}
              type={"email"}
              label="メールアドレス"
              fullWidth
              margin="normal"
              inputRef={register}
              helperText={errors.email?.message}
              error={!!errors.email?.message}
              InputLabelProps={{
                shrink: true
              }}
            />
            <TextField
              name={"message"}
              label="メッセージ"
              multiline
              fullWidth
              rows={10}
              inputRef={register}
              helperText={errors.message?.message}
              error={!!errors.message?.message}
              margin="normal"
            />
            <Recaptcha
              className={classes.recaptcha}
              onChange={(value) => setRecaptcha(value)}
              sitekey={SITE_RECAPTCHA_KEY}
            />
            <Button type={"submit"} fullWidth variant="contained" color={"secondary"}>
              送信
            </Button>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
